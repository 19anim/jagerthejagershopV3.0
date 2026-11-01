# 3D Shop: Saigon Street and Real Store — Design

**Date:** 2026-11-01
**Status:** Approved in brainstorming → ready for an implementation plan
**Builds on:** `2026-08-18-3d-shop-experience-design.md`, `2026-08-21-product-3d-model-mapping-design.md`
**Prototypes shown to the user:** `C:\tmp\jager-proto\street.html`, `interior.html` (scratch, not in the repo)

## Goal

Make the 3D mode look like a real shop a person walks into, on a believable
street: a modern Saigon shophouse street at dusk outside, a warm heritage bottle
shop inside, staff and locals as ambient life, seasonal decor, no flicker, and
smooth on phones. Every flow the 3D mode has today keeps working.

## Decisions (from the brainstorming Q&A)

| Topic | Decision |
| --- | --- |
| Setting | Modern Saigon shophouse street (tile, glass, LED signs, few cables) |
| Time of day | Dusk, lamps and signs lit, warm shop glow |
| Assets | Built in code + about 8 CC0 photo textures (1K webp, ~3 MB total) |
| Build approach | A: code-built world in React Three Fiber (no Blender bake) |
| Interior style | Heritage bottle shop: dark wood, brass, green, brick back wall, oak floor, warm light |
| Layout | Wall bays left and back, two double-sided gondolas, cashier inside the door on the right with a back-bar |
| Shelf stock | Only real products, repeated in product blocks; every bottle is clickable |
| People | Cashier + stocker inside; a sitting neighbour + 2–3 passers-by outside; no moving traffic |
| Outside navigation | Walk the block (same WASD / drag / joystick as inside) |
| Decor | Rich, brand-related decor (see Interior decor) |
| Seasonal themes | Tết, Christmas, Mid-Autumn, Halloween; admin setting with a date fallback |

## Must keep working (regression contract)

- "CHẾ ĐỘ 3D" toggle and `/:locale/shop3d` route, `useShopMode`, WebGL fallback.
- Walking: WASD / arrows, drag to look, touch joystick (`walk-controls`, `touch-joystick`).
- Door click: outside → opens and walks in; inside → walks out. Phase machine
  `outside → entering → inside → exiting → outside` in `shop3d.page.jsx`.
- Bottles resolved by `shop3dModel` (`resolveProductInstances`), the bottle
  panel (name, price, stock, Add to cart / Sold out), `addItemToCart(product, 1)`,
  the "added" toast, the cart overlay, the HUD, POS → checkout, basket → cart.
- Walking freezes while the cart overlay is open.

## World layout (metres, y up, shop front faces +z)

The shop keeps today's footprint so the door, collision and interior numbers stay valid.

| Zone | Extent |
| --- | --- |
| Shop interior (clear) | x −4.75 → 4.75, z −5.5 → 5.5, floor y 0.06, ceiling 3.66 |
| Shop front wall face | z 5.6; door opening x 1.63 → 2.97 (centre 2.30); display window x −4.2 → −0.6, sill y 0.5, top y 2.65 |
| Near sidewalk | z 5.6 → 9.0, top y 0.15 |
| Kerb | z 9.0 → 9.18 |
| Road | z 9.18 → 17.0, y 0 (lane line z 13.1, edge lines 9.6 / 16.6) |
| Far sidewalk | z 17.0 → 20.4, top y 0.15 |
| Far facades | z 20.4, facing −z |
| Neighbours (near side) | x −40 → −5.15 and 5.15 → 40, facades at z 5.6 |
| Walkable block outside | x −24 → 24, z 5.9 → 20.0 (fog hides the ends) |

The sidewalk top (0.15) sits above the interior floor (0.06): the threshold
gets a 0.09 m step tread inside the door frame so the two never meet in one plane.

## Architecture

New code lives in `src/components/shop3d/world/`; data and pure logic in `src/utils/shop3d/`.

```
components/shop3d/
  scene-canvas.component.jsx      (kept; lighting/env/quality wiring changes)
  walk-controls.component.jsx     (kept; gains bounds per phase + outside start)
  product-bottle.component.jsx    (replaced by world/products, panel extracted)
  world/
    street/        road.jsx, sidewalks.jsx, shophouse.jsx, shophouse-row.jsx,
                   street-lamp.jsx, tree.jsx, motorbike.jsx, cables.jsx, sky.jsx
    shopfront/     shopfront.jsx (facade, sign with logo.png, window, awning), door.jsx
    interior/      room-shell.jsx, wall-bay.jsx, gondola.jsx, cashier.jsx,
                   decor/*.jsx (antler-mount, posters, chalkboard, barrel-stack,
                   chiller, tasting-bar, ceiling-fan, clock, plants, mat, baskets)
    products/      product-shelves.jsx (instancing), bottle-panel.jsx (the panel UI)
    people/        people.jsx, use-character.js, routines.js
    themes/        theme-layer.jsx, tet.jsx, christmas.jsx, midautumn.jsx, halloween.jsx
    materials/     textures.js (CC0 loader + canvas textures), materials.js (shared PBR set)
    quality.js     tier detection + settings
utils/shop3d/
  layout.js        fixtures, shelf runs, decor anchors (data only)
  product-blocks.js  product → facing slots (pure)
  themes.js        theme resolution (pure, date tables)
  people-paths.js  walker paths + pause rule (pure)
```

`src/utils/shop3d.config.js` and `shop3d.utils.js` stay as the public entry
points (re-exporting the new modules) so existing imports and tests keep working.

### Units and their contracts

- **materials/** — one shared material per surface type (`asphalt`, `paver`,
  `facadeTile[n]`, `oak`, `brick`, `plaster`, `darkWood`, `brass`, `green`,
  `glass`, `led`, …). Components never create ad-hoc materials per mesh; this
  keeps draw calls and memory down and lets themes/quality tweak them in one place.
- **street/** — pure scenery; static meshes are merged per material
  (`BufferGeometryUtils.mergeGeometries`) at mount. Seeded random so the street is
  identical on every visit.
- **shopfront/door.jsx** — the existing hinge door behaviour (rotation 0 → +1.6 (inward),
  hover hint, click → enter / exit), on a code-built door leaf.
- **interior/** — `wall-bay` and `gondola` take a shelf-run description from
  `layout.js` and expose their shelf surfaces; the same data feeds collision boxes
  and product slots, so geometry and products cannot drift apart.
- **products/** — see Products.
- **people/** — see People.
- **themes/** — see Seasonal themes.

## Products

### Product blocks (`product-blocks.js`, pure)

Input: products (with `shop3dModel`, `stock`), shelf runs from `layout.js`
(`{ id, origin, direction, length, levels[], depth, maxBottleHeight }`), and a
block plan `PRODUCT_BLOCKS = [{ model, runId, level, facings }]`.
Output: `instances[] = { product, model, position, rotationY, blockId, facing, depthIndex }`.

Rules:
- A block is `facings` bottles side by side (pitch = bottle diameter + 15 mm),
  each facing `depth = clamp(stock, 1, maxDepth)` deep (the existing "fuller shelf"
  rule; `maxDepth` 4 on the high tier, 1 on the low tier). At least one bottle
  shows at 0 stock so "Sold out" stays visible.
- Blocks are packed along the run with a 40 mm gap; a block that does not fit is
  dropped with a `console.warn` (never overlaps, never pokes past the run end).
- Tall bottles (1000 ml) only go on levels whose clearance fits `maxBottleHeight`.
- Products whose model matches no block, and blocks whose model matches no
  product, are skipped with a warning (today's behaviour).
- Placement: eye-level levels (1.0–1.6 m) on the left wall and gondola ends get
  the hero products; minis go in the chiller and by the counter.

### Rendering and interaction

- Each product model GLB is loaded once (`useGLTF`); each of its meshes becomes
  one `InstancedMesh` per product with the block's instances. Glass materials drop
  `transmission`/`volume` and become `MeshPhysicalMaterial` with clearcoat (the
  costly, flicker-prone transmission pass is not used).
- Click → `instanceId` → instance → product; opens the existing panel
  (extracted into `bottle-panel.jsx`, unchanged markup and behaviour, anchored with
  drei `<Html>` at the clicked bottle). Pointer-missed closes it.
- Hover: the hovered instance is scaled ×1.05 (matrix update of that one instance)
  and the cursor turns into a pointer, as today.
- Label textures: today's label behaviour is kept (product image on `slot_face`
  where the model has one; the per-product GLBs carry their own embedded labels).

## Navigation

- `WalkControls` gets `bounds` and colliders per phase. Outside it uses the
  walkable block (see layout) plus colliders for lamps, trees, planters, parked
  motorbikes, stools and the shop/neighbour facades; inside it keeps today's room
  bounds plus colliders for every wall bay, gondola, counter and decor piece.
- Outside start pose: far sidewalk, x 2.3, z 18.5, eye 1.6 + 0.15, looking at the door.
- Door click while outside: the door swings, then the existing camera dolly walks
  you from wherever you stand to the doorway and in (`INTERIOR_POSE` unchanged).
  Exit reverses to the near sidewalk just outside the door (z 7.2, facing the street).
- OrbitControls is removed (outside is now walking).
- People never block (no colliders).

## Street

- Shophouses: width 4–5.6 m, 2–5 upper floors at 3.4 m on a 4.0 m ground floor,
  12 m deep boxes (only the front 1 m is detailed; the rest is a plain box).
  Facade = tile texture variant, window bands (lit warm interior card or dark
  reflective glass), 70% with balconies (slab + glass rail + brass handrail +
  plants), AC units, LED sign (canvas text: CÀ PHÊ SỮA ĐÁ, NHÀ THUỐC, ĐIỆN THOẠI,
  TIỆM BÁNH, SPA • NAIL, QUÁN PHỞ, …), ground floor open (lit shop card) or shutter.
- The shop: today's ground floor becomes the green/gold shopfront (logo.png on the
  sign, lit display window showing the real interior through glass, orange awning),
  plus two upper floors in cream tile with green window frames.
- Road (asphalt texture, lane and edge lines, a zebra crossing), paved sidewalks,
  stone kerbs, curved LED street lamps (spot light pools on the high tier), trees in
  planters, a few parked motorbikes, red/blue plastic stools, two overhead cables.
- Sky: gradient dome shader (zenith blue → violet → orange horizon, sun glow down
  the street); the scene environment map is generated from the sky with
  `PMREMGenerator` (no runtime HDR download). FogExp2 hides both block ends.

## Interior

- Shell: oak plank floor, brick back wall, plaster side/front walls with a green
  skirting, dark green ceiling with black track rails and spot cans.
- Wall bays: left wall full length, back wall (x −4.3 → 2.3); dark-wood uprights,
  shelves with a brass lip and a warm LED strip under each level, green plinth and
  crown with a brass rail.
- Gondolas: two, double-sided, 1.8 m tall, x −2.2 and 0.3, z −3.6 → 1.0, green
  end caps.
- Cashier: counter along the right side just inside the door (centre x 3.35,
  z 1.0 → 3.6), back-bar shelving on the right wall behind it, three green pendant
  lamps over the counter; POS terminal (checkout) and desk phone on top.
- Keep and re-material these existing GLBs: `pos-terminal`, `desk-phone`,
  `shopping-basket`, `gift-box`, `drinking-glass`, `jigger`, `pourer`, `shaker`,
  `flask`. Their named materials map onto the shared PBR set
  (`metal_gold` → brass, `dark` → black lacquer, `paint_green` → green, …).
- Retired from the scene: `wall-set`, `roof`, `floor-interior`, `doorway-frame`,
  `room-shell`, `liquor-shelf-bay`, `wine-cabinet`, `accessory-shelf`,
  `accessory-stand`, `specials-podium`, `cashier-counter`, `ceiling-spotlight`,
  `floor-rug`, `framed-art`, `neon-sign`, `oak-barrel`, `potted-plant`,
  `wooden-crate`, `inspect-pedestal`, `contact-board`, `shipping-station`,
  `sidewalk-base`, `display-window`, `entrance-door`, `signboard`, `street-lamp`,
  `planter`. Their files stay in `src/assets` (not deleted) but are no longer preloaded.

### Interior decor

Stag-antler wall mount with brass plaque (back wall, centred above the bay crown
at y ≈ 3.2), orange neon "Jäger the Jäger" on the bare brick right of the back bay
(x 2.4 → 4.7, y ≈ 2.9), framed vintage posters (left wall above the bay
crown), chalkboard A-frame "today's pick" (inside by the window and outside on the
sidewalk), oak barrel and crate promo stack by the display window, gift-box tower,
lit glass-door chiller (minis and Cold Brew) against the right wall at z −2.6 → −1.4,
tasting corner in the back-right corner under the neon (small bar x 2.8 → 4.4,
z −5.0 → −4.4, two stools, glass/jigger/pourer/shaker/flask), stack of shopping baskets by the door
(click → cart), monstera plants, entrance mat, ceiling fan (slow spin), wall clock.

## People

- Assets: copy `worker.glb` (CC0, Quaternius UBC male + UAL clips) and its
  `LICENSE.txt` from the workshop app into `src/assets/people/`. Build
  `worker-female.glb` from the UBC female body with the same clips using an
  adapted copy of `client/scripts/workshop/build-worker-glb.mjs`, committed as
  `scripts/build-people-glb.mjs`. It reads only the pack files, run with plain
  node; the downloaded pack is treated as data.
- Loading: `useGLTF` (meshopt enabled in drei), one skinned clone per person via
  `SkeletonUtils.clone`, an `AnimationMixer` each, crossfades between clips.
  Outfits are recolours of the body/accent materials (staff: green shirt, orange
  apron accent; locals: varied casual colours).
- Cast and routines:
  - Cashier (female, behind the counter): `Idle_Loop`, occasional
    `Idle_Talking_Loop` and `Interact` (POS); turns to face the player within 3 m.
  - Stocker (male, aisle): walks between two shelf points (`Walk_Loop`), plays
    `PickUp_Table` at each, idles a few seconds.
  - Neighbour (outside, on a stool by the next shophouse): `Sitting_Idle_Loop`
    with occasional `Sitting_Talking_Loop`.
  - 2–3 passers-by: loop along the sidewalks (`Walk_Loop`), one stops to idle
    by a shopfront now and then.
- `people-paths.js` (pure): path following by distance, and the pause rule: a
  walker whose next 1.2 m of path is within 0.7 m of the player pauses (idle)
  until it is clear. No colliders.
- Low tier: inside people only when inside; outside people only when outside.

## Seasonal themes

### Backend (`jagerthejagershopV3.0_BE`)

- Model `shopSetting.model.js`: singleton `{ key: "main", shop3dTheme: String }`,
  enum `auto | none | tet | christmas | midautumn | halloween`, default `auto`.
- Routes `settings.route.js`: `GET /api/settings/shop3d` (public) →
  `{ shop3dTheme }`; `PUT /api/settings/shop3d` (`requireAdmin` middleware, as the
  product routes use) validates the enum.

### Admin (frontend)

- A "3D shop theme" select (Auto by date / None / Tết / Christmas / Mid-Autumn /
  Halloween) on the admin assets page, saved with the PUT route.

### Resolution (`themes.js`, pure)

`resolveTheme(setting, now)`:
- a concrete theme → that theme; `none` → no theme;
- `auto`, missing, or the request failed → by date (Vietnam time, UTC+7):
  - Tết: 21 days before → 7 days after the lunar new year (table 2026–2040);
  - Christmas: Dec 1 → Dec 31;
  - Mid-Autumn: 14 days before → 2 days after the 15th day of the 8th lunar
    month (table 2026–2040);
  - Halloween: Oct 20 → Oct 31;
  - otherwise none.
- A `?theme=` query parameter forces a theme for previewing (also used by tests).

Date tables (to verify against a Vietnamese lunar calendar during implementation):
Tết 2026-02-17, 2027-02-06, 2028-01-26, 2029-02-13, 2030-02-03, 2031-01-23,
2032-02-11, 2033-01-31, 2034-02-19, 2035-02-08, 2036-01-28, 2037-02-15,
2038-02-04, 2039-01-24, 2040-02-12. Mid-Autumn 2026-09-25, 2027-09-15,
2028-10-03, 2029-09-22, 2030-09-12, 2031-10-01, 2032-09-19, 2033-09-08,
2034-09-27, 2035-09-16, 2036-10-04, 2037-09-24, 2038-09-13, 2039-10-02, 2040-09-20.

### Decor layers

Each theme is one lazily-mounted component placing props at named anchors from
`layout.js` (`doorTop`, `windowInside`, `counterTop`, `shelfCrowns`, `ceiling`,
`sidewalkByDoor`, `skyMoon`, `facadeBand`):
- **Tết:** red lanterns (shop ceiling, awning, neighbour balconies), peach and
  apricot blossom branches in vases, two kumquat trees by the door, red banners
  ("Chúc Mừng Năm Mới"), lì xì envelopes and red gift boxes on the counter.
- **Christmas:** a tree with lights by the window, warm string lights on the shelf
  crowns and awning, garland on the counter, a wreath on the door, gift boxes.
- **Mid-Autumn:** star lanterns and round paper lanterns, mooncake gift boxes on
  the counter, a large moon low in the sky.
- **Halloween:** carved pumpkins (one glowing) by the door and on shelf ends,
  cobwebs in two ceiling corners, orange/purple accent light.
Theme props are code-built (lathe/extrude geometry + canvas textures), lit
emissive where they glow (string lights are an instanced emissive mesh, not lights).

## Rendering rules (no flicker)

1. No coplanar faces anywhere: a decal, marking, label or trim sits ≥ 1 mm proud
   of its base (≥ 2 mm outdoors at distance) or uses `polygonOffset`
   (factor −1, units −1).
2. One floor source per area; no duplicate shells (the retired GLB envelope is
   gone; walls are single planes or boxes, never stacked).
3. Transparent materials: single-sided, `depthWrite: false`, never two
   transparent surfaces overlapping in the same view direction (glass rails, shop
   window glass, chiller doors).
4. Shadows: `bias −0.0004`, `normalBias 0.02`; outside one directional light with a
   fixed shadow frustum over the block and the shop (a following frustum shimmers);
   inside one shadow spot over the aisles.
   Thin trims and bottles do not cast shadows (bottles receive only).
5. Camera `near 0.08`, `far 160`.
6. No runtime-fetched HDRs or external URLs; textures ship in `src/assets`.
7. Emissive signs/LEDs use `toneMapped: true` with emissive intensity ≤ 4;
   bloom threshold 0.9 so only lights bloom.

## Lighting

- Outside: low warm directional "sun" down the street (`#ffad70`), hemisphere sky
  fill, generated sky environment (intensity ~0.55), street-lamp spot pools (high
  tier), a warm point light spilling from the shopfront.
- Inside: hemisphere warm fill, track spot lights on the wall bays and gondolas
  (one casts shadows), pendant point lights over the counter, LED strips emissive,
  neon point light; the environment intensity drops to ~0.25 inside.
- `ACESFilmicToneMapping`, exposure ~1.1 outside / 1.0 inside (eased on entry/exit).

## Performance

- Tier detection (`quality.js`): `low` for coarse pointer or `deviceMemory ≤ 4`;
  drei `PerformanceMonitor` steps down to `low` if FPS drops, never back up mid-visit.
- High: DPR ≤ 2, shadow map 2048, bloom, lamp spot lights, bottle depth ≤ 4.
- Low: DPR ≤ 1.25, shadow map 1024, no bloom, emissive-only lamps, bottle depth 1,
  far facades without balcony detail.
- Static street and interior geometry merged per material; bottles instanced;
  people ≤ 6 skinned meshes.
- Budgets: ≤ 1800 bottles on high (≈ 4 M triangles), ≤ 450 on low (≈ 1 M); bottom
  shelves hold cardboard cases; < 250 draw calls; added texture payload ≤ 3.5 MB;
  desktop 60 fps, mid-range phone ≥ 30 fps.
- High tier keeps the interior mounted while outside (the window shows the real
  store); low tier mounts it on entry and shows a lit interior card behind the
  window until then.
- `SCENE_GLBS` preload list shrinks to the kept fixture GLBs, the product GLBs in
  use and the two people GLBs.

## Assets and licensing

- CC0 textures (Poly Haven / ambientCG), 1K, converted to webp:
  asphalt, sidewalk pavers, two facade tile types, oak floor planks, red brick,
  plaster, dark wood (+ normal/roughness maps where it matters: asphalt, brick,
  oak). Stored in `src/assets/shop3d-textures/` with a `CREDITS.md` listing each
  source URL and licence.
- People GLBs and `LICENSE.txt` in `src/assets/people/`.

## Error handling

- Theme request fails → date fallback; unknown theme value → none.
- A texture fails → the material keeps its base colour (no crash).
- A people GLB fails → that person is skipped (error boundary per person).
- Product/fixture mismatches → warn and skip (as today).
- No WebGL → existing fallback page.

## Testing and verification

- Vitest (pure logic): `product-blocks` (bounds, no overlaps, depth by stock,
  minimum one bottle, height clearance, model/product mismatch warnings,
  instance → product mapping), `themes` (each window edge, admin override,
  `none`, failed request, `?theme=`), `people-paths` (path progress, pause rule),
  existing `shop3d.utils.test.js` still green.
- Backend: route-level check of GET default and PUT validation (manual with curl
  against a local server if the BE has no test runner).
- In the real app (dev server, desktop 1440×900 and phone 390×844):
  walk outside and inside, door in/out, joystick on phone size, click bottle →
  panel → add to cart → toast → cart overlay → POS → checkout route, basket →
  cart, each theme via `?theme=`, a flicker sweep (screenshots while moving past
  shelves, kerbs, markings, windows), FPS / draw-call readout from
  `renderer.info` on both tiers, no console errors.

## Out of scope

Moving traffic, a browsing customer, day/night cycle, Blender-baked lighting,
interior rooms beyond the shop floor, product model changes, new product GLBs.

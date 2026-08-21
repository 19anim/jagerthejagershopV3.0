# Using these models in your own three.js scene

You have two routes. Both give the same object — pick one.

---

## Route A — download the `.glb` and load it (most common)

1. Open a viewer page (e.g. `batch3/bottle-tall.html`).
2. Click **Download GLB** → you get `jager_bottle_tall.glb`.
3. Put it in your project, e.g. `public/models/jager_bottle_tall.glb`.
4. Load it with `GLTFLoader`:

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/models/jager_bottle_tall.glb', (gltf) => {
  const bottle = gltf.scene;
  bottle.position.set(0.4, 1.105, -0.2);   // base sits at y = 0, so y = shelf height
  scene.add(bottle);

  // every part kept its name — grab one directly:
  const label = bottle.getObjectByName('label_slot');
  label.material = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load('/img/label-jager.png'),
    roughness: 0.85,
  });
});
```

Good when: you want assets you can also open in Blender, hand to a teammate,
or load lazily. Costs a network request per file.

**All of them at once:** open `export-all-glb.html` and hit *Download ZIP* — it
builds all 42 objects, exports each to GLB and packs them with a folder per batch
(`01 Storefront exterior/`, `02 Interior structure/`, `03 Products/`,
`04 Interactive fixtures/`, `05 Ambience/`, `06 Building envelope/`). Individual files
are downloadable from the same list.

---

## Route B — import the builder module (no files to load)

`models/batch1.js` … `batch5.js` are plain ES modules. Copy them plus
`jager-brand.js` into your project and call the builder — the geometry is
created in JS, so there is nothing to download at runtime and the five
materials are shared across every object automatically.

```js
import * as THREE from 'three';
import { bottleTall, bottleWine } from './models/batch3.js';
import { liquorShelf } from './models/batch2.js';
import { studioEnv } from './jager-brand.js';   // optional: only if you want the same env look

const shelf = liquorShelf(THREE);
shelf.position.set(-1.2, 0, -3.3);
scene.add(shelf);

const bottle = bottleTall(THREE);
bottle.position.set(-1.2, 0.62 + 0.035, -3.25); // shelf board 2 top
scene.add(bottle);
```

Note the modules take `THREE` as an argument — pass your own imported three.js,
so there is only ever one copy of the library.

Good when: it's a web-only walkthrough. Smallest download, fewest moving parts.

---

## Placing things: read the spec panel

Every viewer page prints, for that object:

- **pivot** — what `(0,0,0)` means for it. Most objects: centre of footprint,
  base at `y = 0`, front facing `+z`. So `obj.position.set(x, 0, z)` puts it on
  the floor. Exceptions are stated (the door pivots on its hinge, the ceiling
  spotlight hangs *below* its origin, wall pieces pivot on their mounting face).
- **bounding box** — W × H × D in metres, for spacing and collision.
- **image slots** — the named flat planes with their aspect ratios.

## Filling the image slots

Slots are ordinary meshes with a cream placeholder material. Swap the material
(or just add a map) at runtime:

```js
const tex = new THREE.TextureLoader().load('/img/logo.png');
tex.colorSpace = THREE.SRGBColorSpace;
root.getObjectByName('logo_slot').material =
  new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.9 });
```

Match the stated ratio (e.g. `logo_slot` on the signboard is 5 : 1) or the image
will stretch. Bottle label slots are not planes stuck on the front: they are **bands of the
glass surface itself**, re-sampled 1 mm outward. A label therefore follows the
flat front face *and* curves around the corner radius exactly like real paper,
and its UVs run 0→1 across the true arc length, so artwork never stretches.
`emboss_slot_left`/`_right` sit just *inside* the glass instead — feed them an
engraved-text texture and they read as etched lettering.

## Making a new bottle (or a new accessory)

Every bottle in the range comes from one builder — `models/bottle-kit.js`. A
bottle is a **swept profile**: a list of rings `[halfWidth, halfDepth, cornerRadius, y]`
lofted from base to lip. Because the ring is a rounded rectangle, the same
generator makes the squat rectangular 0.7 L bottle (small corner radius), a round
wine bottle (`halfWidth == halfDepth == cornerRadius`) and a flat hip flask. One
topology, one UV convention, one set of part names — so a new product is a
preset plus a cap style plus a label size, never new geometry code.

Open **batch3/bottle-kit.html** and turn the knobs: it prints the exact
`bottle()` call for what you see. Paste that into `models/batch3.js`:

```js
import { bottle } from './bottle-kit.js';

export const bottleReserve = (THREE) => bottle(THREE, {
  preset: 'herbal',          // profile: herbal · herbal_mini · spirit_tall · whiskey_squat · wine · flask
  name: 'bottle_reserve',    // group + GLB root node name
  height: 0.28,              // optional: scale the whole bottle to this total height
  glass: 'glass_smoked',     // any material key from jager-brand.js
  cap: { style: 'cork', material: 'metal_gold' },   // screw · cork · capsule · none
  neckBand: true,
  label: { w: 0.066, h: 0.096, y: 0.094 },          // or false
  backLabel: true,
  panel: { border: 0.005 },                         // moulded frame around the label
  emboss: { w: 0.022, h: 0.08, y: 0.094 },          // engraved side panels
  liquid: { fill: 0.194 },                          // contents shell
  neckLabel: { w: 0.04, h: 0.026, y: 0.199 },       // or false
});
```

Then duplicate any page in `batch3/`, change the import and the `<h1>`, and you
have an inspector with the spec readout and the GLB/OBJ export buttons.

**A new label on an existing bottle needs none of this** — load the same GLB
twice and assign a different texture to `label_slot` (see above). Only reach for
the kit when the *glass* changes.

**Truly new shape?** Give `bottle()` your own `rings` array (or add a preset).
Rules: metres, base at `y = 0`, front is `+z`, rings ordered bottom → top,
`cornerRadius <= min(halfWidth, halfDepth)`. Everything else follows: labels,
panel frames and engraving are sampled off whatever surface you defined, so they
fit the new shape with no extra work.

The 0.7 L reference bottle is 88 × 62 × 248 mm: straight rectangular body with a
13 mm corner radius, tight shoulder, short round neck, ribbed screw cap, a
moulded label panel front and back, and engraved lettering down both narrow
sides.

Non-bottle accessories (trays, coasters, cases) still go in the batch modules
using the `box`/`span`/`cyl`/`lathe`/`slot` helpers in `jager-brand.js` — same
rules, same shared materials.

## Lights

The viewer pages add their own studio lighting. In your scene, the emissive
parts (`accent_orange_lit`: neon tubes, lamp lantern, spotlight lens, pedestal
glow disc) only *look* lit — add a real light next to them:

```js
scene.add(new THREE.PointLight(0xdd5a12, 3, 4).position.set(0, 3.95, 0)); // street lamp
```


---

## Batch 6 — building envelope + placement surfaces

These six make the set a *building* rather than a facade, and give every
fixture a known deck height to bake into a `FIXTURES` config.

| GLB | Clear size (m) | Top surfaces / key heights |
| --- | --- | --- |
| `wine-cabinet.glb` | 1.10 × 0.46 × 2.05 | shelf deck tops **0.20 / 0.64 / 1.08 / 1.52**; interior clear 1.02 × 0.38 |
| `wall-set.glb` | outer 9.90 × 11.40, H 3.80, t 0.20 | clear interior 9.50 × 11.00, clear height 3.60; door hole x 1.63→2.97 (1.34 × 2.42); window hole x −3.39→−1.71 (1.68 × 2.10, sill 0) |
| `roof.glb` | 9.90 × 11.40 | **pivot at ceiling underside** — place at y = 3.66; joists hang 0.14; parapet +0.49 above slab |
| `accessory-shelf.glb` | 1.60 × 0.30 × 0.92 | deck tops **0.09 / 0.44 / 0.79** local; hang rails 0.365 / 0.715; mount at 1.05 → decks 1.14 / 1.49 / 1.84 |
| `doorway-frame.glb` | opening 1.40 × 2.50, depth 0.24 | place at x = 2.30 in wall_set; door stop at z = −0.06 |
| `floor-interior.glb` | 9.50 × 11.00 × 0.06 | **walking surface y = 0.06** — add 0.06 to every fixture y |

Image slots (all `slot_face` material, swap the material to texture them):
`cabinet_header_slot`, `shelf_label_slot_1..4`, `facade_sign_slot`,
`interior_sign_slot`, `parapet_sign_slot`, `accessory_label_slot_1..3`,
`transom_slot`, `threshold_mat_slot`, `floor_medallion_slot`.

### Assembly order

```
floor_interior      (0, 0,    0)     surface y = 0.06
wall_set            (0, 0.06, 0)     encloses the 9.5 × 11 interior
doorway_frame       (2.30, 0.06, 5.60)
roof                (0, 3.66, 0)     pivot is the ceiling face
wine_cabinet        (-3.4, 0.06, -5.27)  against the back wall
accessory_shelf     (4.6,  1.11, -0.6)   right wall, back plate to wall
```

Add the six filenames to the `SCENE_GLBS` preload list wherever your scene
declares it (e.g. `shop3d.page.jsx`):

```js
'wine-cabinet.glb', 'wall-set.glb', 'roof.glb',
'accessory-shelf.glb', 'doorway-frame.glb', 'floor-interior.glb',
```

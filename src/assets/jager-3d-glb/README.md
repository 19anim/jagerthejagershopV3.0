# Using these models in your own three.js scene

You have two routes. Both give the same object — pick one.

---

## Route A — download the `.glb` and load it (most common)

1. Open a viewer page (e.g. `batch3/bottle-700ml.html`).
2. Click **Download GLB** → you get `jager_bottle_700ml.glb`.
3. Put it in your project, e.g. `public/models/jager_bottle_700ml.glb`.
4. Load it with `GLTFLoader`:

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/models/jager_bottle_700ml.glb', (gltf) => {
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
import { bottle700ml } from './models/bottle-sizes.js';
import { liquorShelf } from './models/batch2.js';
import { studioEnv } from './jager-brand.js';   // optional: only if you want the same env look

const shelf = liquorShelf(THREE);
shelf.position.set(-1.2, 0, -3.3);
scene.add(shelf);

const bottle = bottle700ml(THREE);
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

A new bottle is one `bottle()` call in `models/batch3.js` — the presets and
knobs are documented at the top of `models/bottle-kit.js`:

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

## The size range — six separate models

Six sizes, each **its own model**, not a node inside a combined object. One page, one root
group, one export:

| Page | Root node / GLB | Height | Body glass | Cap |
| --- | --- | --- | --- | --- |
| `batch3/bottle-20ml.html` | `jager_bottle_20ml` | 85 mm | 30 × 20 mm | 18 mm miniature |
| `batch3/bottle-100ml.html` | `jager_bottle_100ml` | 139 mm | 51 × 35 mm | 25 mm |
| `batch3/bottle-200ml.html` | `jager_bottle_200ml` | 165 mm | 64 × 44 mm | 25 mm |
| `batch3/bottle-350ml.html` | `jager_bottle_350ml` | 206 mm | 77 × 53 mm | 31 mm |
| `batch3/bottle-700ml.html` | `jager_bottle_700ml` | 246 mm | 97 × 66 mm | 31 mm |
| `batch3/bottle-1000ml.html` | `jager_bottle_1000ml` | 271 mm | 109 × 75 mm | 31 mm |

**They are not one shape scaled six times.** Closures come in three tiers — an 18 mm miniature cap, a 25 mm cap on 100/200 ml, the full
31 mm ribbed cap from 350 ml up — and within a tier the neck and cap are held at ABSOLUTE
size while only the body scales by the cube root of the volume ratio.
That is why the heights are not a straight cube-root ladder, and why a 100 ml reads as a small
bottle with a full-size cap instead of a shrunken 0.7 L. Each bottle's contents shell is solved
numerically so the liquid actually equals the nominal capacity.

In code, import the size you want — no files to load:

```js
import { bottle700ml, bottle20ml, SIZES, sizeOpts } from './models/bottle-sizes.js';

const b = bottle700ml(THREE, { texBase: '/img/' });
b.position.set(-1.2, 0.655, -3.25);        // base at y = 0, front label faces +z
scene.add(b);
```

`texBase` is where `label-ct-front.png`, `label-ct-back.png` and `cap-ct-wrap.png` live
(default: the module's own folder); pass `{ textures: false }` for plain glass. Base at
`y = 0`, front label faces `+z`, metres throughout.

**The labels** are two paper panels — `label_slot` on `+z` and `label_slot_back` on `−z` —
each a band of the glass surface 1 mm out, so the paper follows the flat face and curves around
the corner radius. Artwork is cropped from the product photographs with the wordmark reset to
**Thuoc Ho Con Huou**, set in the same blackletter face. To reskin, swap the map:

```js
bottle.getObjectByName('label_slot').material.map = myFrontLabel;
bottle.getObjectByName('label_slot_back').material.map = myBackLabel;
```

Before exporting to GLB, `await labelsReady(THREE)` — the exporter reads `texture.image`
synchronously and will otherwise report *no valid image data*.

### Cold Brew Coffee edition

`coldBrew20ml` / `coldBrew1000ml` are the Cold Brew Coffee bottles — 20 ml (85.0 mm) and 1 L
(271.0 mm). Cold Brew is filled in the same mould and the same closure as the Original, so the
glass and the finish tiers are shared; only the artwork changes: black label
(`label-cb-front.png` / `label-cb-back.png`), silver cap top and an orange
"herbal liqueur with coffee" band on the cap wrap (`cap-cb-wrap.png`). The wordmark is the same
blackletter **Thuoc Ho Con Huou**. Any size can take the artwork:

```js
import { coldBrew1000ml, sizedBottle, SIZES } from './models/bottle-sizes.js';

const cb = coldBrew1000ml(THREE);
const cb350 = sizedBottle(THREE, SIZES.find((s) => s.ml === 350), { variant: 'coldbrew' });
await labelsReady(THREE, undefined, 'coldbrew');   // before GLB export
```

Label plates are regenerated from the product photographs by `tools/coldbrew-labels.html`.

### Manifest edition — a different mould

`models/manifest.js` is its own bottle: the flat rectangular Manifest glass, sold here in
**40 ml** and **1 L**. Not a variant of the Original — a separate mould, so a separate module.

| Page | Root node / GLB | Height | Body glass | Cap |
| --- | --- | --- | --- | --- |
| `batch3/manifest-40ml.html` | `mf_bottle_40ml` | 94.2 mm | 36.1 × 19.8 mm | 18 mm miniature |
| `batch3/manifest-1000ml.html` | `mf_bottle_1000ml` | 260 mm | 100 × 55 mm | 31 mm sleeve |

The real size is derived, not guessed: the straight-on product photograph traces at 1352 px on a
520 px body (2.60 : 1), and the 1 L gift box ships six to a 32.1 × 15.5 × 27.3 cm case — one box
is 107 × 77.5 × 273 mm, which puts the bottle at 100 mm across and 260 mm tall. The 55.0 mm depth
is then **solved** so the cavity of the 1.6 mm shell filled to the neck is exactly 1.000 L. The
40 ml body scale is **solved the same way** — bisected until the cavity filled to the base of the
neck is 0.040 L, which lands at 0.361 of the litre (36.1 × 19.8 mm, 94.2 mm tall). A cube-root
ladder would be wrong here: the finish is held at absolute size, so the neck gives back none of
the volume the body loses, and a cbrt body comes out ~12 % short.

Manifest carries **no paper label** — the artwork is printed straight onto clear glass. So
`label_slot` and `label_slot_back` carry TRANSPARENT plates (`label-mf-front.png`,
`label-mf-back.png`), keyed out of the product photographs by `tools/manifest-labels.html`;
the wordmark is reset to **Thuoc Ho Con Huou** in the same blackletter face. The cap is a tall
ribbed sleeve wrapped in `cap-mf-wrap.png`. The narrow sides are plain glass — the vertical
ribbing in the product shots is on the carton, not the bottle — and the contents are only 72 %
opaque, so the back print reads faintly through the front the way it does in the photographs.

```js
import { manifest40ml, manifest1000ml, printsReady } from './models/manifest.js';

const b = manifest1000ml(THREE);      // base at y = 0, printed front faces +z
await printsReady(THREE, './models/');  // before GLB export
```

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

# Product → 3D Model Mapping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each product document a `shop3dModel` attribute (a unique per-product GLB file name) that the 3D shop uses to choose the model AND to identify which product sits in each slot, replacing brittle name-based matching.

**Architecture:** Add one string field to the Mongoose product schema. The backend controller already forwards unknown body fields, so add/edit need only a trim in the normalizer. The frontend slot config (`PRODUCT_SLOTS`) drops its per-slot `glb`/`productName` and instead references a `model` file name; the resolver matches `product.shop3dModel === slot.model` and renders `product.shop3dModel`. A one-off backfill script seeds existing products. The admin form gets a text input.

**Tech Stack:** Node/Express + Mongoose (backend), React + Vite + `@react-three/fiber`/`drei` (frontend), Vitest (frontend tests).

## Global Constraints

- Backend field: `shop3dModel`, type `String`, `default: ""`, **no unique index**.
- Uniqueness of model names is a maintained convention, NOT enforced by the DB.
- A product with `shop3dModel === ""` is excluded from the 3D shop (never placed).
- A slot whose `model` matches no product is skipped with `console.warn`.
- Each GLB is single-node, single-size; `vol` is NOT used for 3D size selection.
- Use `rtk` prefix for all git/test/build commands (per user CLAUDE.md).
- Backend dir: `jagerthejagershopV3.0_BE`. Frontend dir: `jagerthejagershopV3.0` (git root).

---

### Task 1: Add `shop3dModel` to the product schema

**Files:**
- Modify: `jagerthejagershopV3.0_BE/src/model/product.model.js:57-59`

**Interfaces:**
- Produces: product documents carrying a `shop3dModel: String` field (default `""`).

- [ ] **Step 1: Add the field to the schema**

In `product.model.js`, after the `isNewProduct` field (currently lines 57-59) and before the closing `}` of the schema fields, add:

```js
    isNewProduct: {
      type: Boolean,
    },
    shop3dModel: {
      type: String,
      default: "",
    },
```

- [ ] **Step 2: Sanity-check the model loads**

Run: `cd jagerthejagershopV3.0_BE && node -e "require('./src/model/product.model'); console.log('ok')"`
Expected: prints `ok` with no schema error.

- [ ] **Step 3: Commit**

```bash
rtk git add jagerthejagershopV3.0_BE/src/model/product.model.js
rtk git commit -m "feat(be): add shop3dModel field to product schema"
```

---

### Task 2: Trim `shop3dModel` in the controller normalizer

**Files:**
- Modify: `jagerthejagershopV3.0_BE/src/app/controllers/products.controller.js:8-27`

**Interfaces:**
- Consumes: `shop3dModel` on the request body (already forwarded via `{ ...body }`).
- Produces: normalized product objects where `shop3dModel` is trimmed, or absent when blank (so an empty edit submit does not clobber an existing value).

- [ ] **Step 1: Add trim/omit logic to `normalizeProductFields`**

In `products.controller.js`, inside `normalizeProductFields`, add these lines just before the final `return product;` (currently line 26):

```js
  if (typeof product.shop3dModel === "string") {
    const trimmed = product.shop3dModel.trim();
    if (trimmed) product.shop3dModel = trimmed;
    else delete product.shop3dModel;
  }

  return product;
```

- [ ] **Step 2: Sanity-check the controller loads**

Run: `cd jagerthejagershopV3.0_BE && node -e "require('./src/app/controllers/products.controller'); console.log('ok')"`
Expected: prints `ok`.

- [ ] **Step 3: Commit**

```bash
rtk git add jagerthejagershopV3.0_BE/src/app/controllers/products.controller.js
rtk git commit -m "feat(be): normalize shop3dModel in product create/edit"
```

---

### Task 3: Backfill script for existing products

**Files:**
- Create: `jagerthejagershopV3.0_BE/src/scripts/backfillShop3dModel.js`

**Interfaces:**
- Consumes: existing product documents (matched by `name`).
- Produces: each mapped product gets a unique `shop3dModel` file name. Products not in the map are left untouched (`""`).

**Note:** The legacy frontend `PRODUCT_SLOTS` reused `bottle-herbal.glb` across products. Per the spec's "one product → one unique GLB" rule, this script assigns a UNIQUE file name per product (derived from the product's existing `slug`). The real per-product GLB assets are produced separately; until each asset file exists, the product stays hidden from the 3D shop (skip rule) even though the field is set.

- [ ] **Step 1: Write the script**

Create `jagerthejagershopV3.0_BE/src/scripts/backfillShop3dModel.js`:

```js
/*
 * One-time backfill: assign a unique `shop3dModel` GLB file name to each
 * product that currently appears in the 3D shop. The file name is derived
 * from the product's existing slug so it is stable and unique per product.
 *
 * Products not listed here keep shop3dModel = "" and stay hidden from the
 * 3D shop until a model is assigned (via the admin form or a later backfill).
 *
 * Run manually: node src/scripts/backfillShop3dModel.js
 */
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config({ path: path.join(__dirname, "../.env") });

const productModel = require("../model/product.model");

// Product display name -> unique GLB file name (one node per file).
const MODEL_BY_NAME = {
  "Jagermeister Original 700ml": "jager-original-700.glb",
  "Jagermeister Original 1000ml": "jager-original-1000.glb",
  "Jagermeister Orange 1000ml": "jager-orange-1000.glb",
  "Jagermeister Original 200ml": "jager-original-200.glb",
  "Jagermeister Original nội địa Đức 700ml": "jager-original-de-700.glb",
  "Jagermeister Original 20ml": "jager-original-20.glb",
  "Jagermeister Original nội địa Đức 100ml": "jager-original-de-100.glb",
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to DB");

  let updated = 0;
  let missing = 0;
  for (const [name, model] of Object.entries(MODEL_BY_NAME)) {
    const result = await productModel.updateOne(
      { name },
      { $set: { shop3dModel: model } }
    );
    if (result.matchedCount === 0) {
      console.warn(`[missing] no product named "${name}"`);
      missing += 1;
    } else {
      updated += 1;
    }
  }

  console.log(`Backfill done: updated ${updated}, missing ${missing}`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
```

- [ ] **Step 2: Verify the script parses**

Run: `cd jagerthejagershopV3.0_BE && node -c src/scripts/backfillShop3dModel.js && echo "syntax ok"`
Expected: prints `syntax ok`.

- [ ] **Step 3: Commit**

```bash
rtk git add jagerthejagershopV3.0_BE/src/scripts/backfillShop3dModel.js
rtk git commit -m "feat(be): add shop3dModel backfill script"
```

*(Running the script against a live DB is a deploy step, not part of this plan.)*

---

### Task 4: Switch the resolver to match by `shop3dModel`

**Files:**
- Modify: `jagerthejagershopV3.0/src/utils/shop3d.utils.js:34-57`
- Modify: `jagerthejagershopV3.0/src/utils/shop3d.utils.js:5-22` (remove dead `resolveBottleInstances`)
- Test: `jagerthejagershopV3.0/src/utils/shop3d.utils.test.js`

**Interfaces:**
- Consumes: `products` (each may have `shop3dModel`), `fixtures`, and `slots` shaped `{ model, fixtureId, slot, rotationY? }`.
- Produces: `resolveProductInstances(products, fixtures, slots)` returns instances `{ product, glb: product.shop3dModel, position, rotationY }`; slots with no product match are warned and dropped; products with empty `shop3dModel` are never matched.

- [ ] **Step 1: Update the tests to the new contract (write failing tests first)**

Replace the entire `jagerthejagershopV3.0/src/utils/shop3d.utils.test.js` with:

```js
import { describe, expect, it, vi } from "vitest";
import {
  resolveProductInstances,
  resolveAccessoryPlacements,
  getLabelTextureUrl,
} from "./shop3d.utils";

const products = [
  { _id: "p1", name: "Jagermeister Original 700ml", shop3dModel: "jager-original-700.glb", image: "https://res.cloudinary.com/x/upload/v1/a.jpg", priceInInteger: 500, stock: 3, slug: "jager-700" },
  { _id: "p2", name: "Jagermeister Original 20ml", shop3dModel: "jager-original-20.glb", image: "", priceInInteger: 100, stock: 5, slug: "jager-20" },
  { _id: "p3", name: "No Model Product", shop3dModel: "", image: "", priceInInteger: 1, stock: 1, slug: "no-model" },
];

const fixtures = [
  { id: "shelf", glb: "liquor-shelf-bay.glb", position: [0, 0, -1.6], surfaceY: 0.9 },
  { id: "podium", glb: "specials-podium.glb", position: [-2, 0, 0.4], surfaceY: 0.5 },
];

describe("resolveProductInstances", () => {
  it("matches by shop3dModel and returns glb === product.shop3dModel", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const slots = [
      { model: "jager-original-700.glb", fixtureId: "shelf", slot: [0.5, 0, 0] },
    ];
    const result = resolveProductInstances(products, fixtures, slots);
    expect(result).toHaveLength(1);
    expect(result[0].product._id).toBe("p1");
    expect(result[0].glb).toBe("jager-original-700.glb");
    // x: 0 + 0.5, y: 0 + 0.9 + 0, z: -1.6 + 0
    expect(result[0].position).toEqual([0.5, 0.9, -1.6]);
    warn.mockRestore();
  });

  it("does not match products with an empty shop3dModel", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const slots = [{ model: "", fixtureId: "shelf", slot: [0, 0, 0] }];
    expect(resolveProductInstances(products, fixtures, slots)).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("warns and drops slots with an unknown model or fixture", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const slots = [
      { model: "ghost.glb", fixtureId: "shelf", slot: [0, 0, 0] },
      { model: "jager-original-20.glb", fixtureId: "nope", slot: [0, 0, 0] },
    ];
    expect(resolveProductInstances(products, fixtures, slots)).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("is unaffected by product name changes (regression guard)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const renamed = [{ ...products[0], name: "Totally Different Name" }];
    const slots = [{ model: "jager-original-700.glb", fixtureId: "shelf", slot: [0, 0, 0] }];
    const result = resolveProductInstances(renamed, fixtures, slots);
    expect(result).toHaveLength(1);
    expect(result[0].product._id).toBe("p1");
    warn.mockRestore();
  });
});

describe("resolveAccessoryPlacements", () => {
  it("resolves accessory props onto fixture surfaces without a product", () => {
    const result = resolveAccessoryPlacements(fixtures, [
      { glb: "jigger.glb", fixtureId: "podium", slot: [0, 0, 0.2] },
    ]);
    expect(result[0].glb).toBe("jigger.glb");
    expect(result[0].position[0]).toBeCloseTo(-2);
    expect(result[0].position[1]).toBeCloseTo(0.5);
    expect(result[0].position[2]).toBeCloseTo(0.6);
  });
});

describe("getLabelTextureUrl", () => {
  it("returns an optimized cloudinary url when image present", () => {
    expect(getLabelTextureUrl(products[0])).toContain("/upload/");
    expect(getLabelTextureUrl(products[0])).toContain("res.cloudinary.com");
  });

  it("returns the fallback logo when image missing", () => {
    expect(getLabelTextureUrl(products[1])).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd jagerthejagershopV3.0 && rtk vitest run src/utils/shop3d.utils.test.js`
Expected: FAIL — `resolveProductInstances` still keys by name / reads `slot.glb`, and the removed `resolveBottleInstances` import is gone.

- [ ] **Step 3: Rewrite the resolver**

In `jagerthejagershopV3.0/src/utils/shop3d.utils.js`, delete the entire `resolveBottleInstances` export (lines 5-22) and replace `resolveProductInstances` (lines 34-57) so the file reads:

```js
import { getOptimizedImageUrl } from "./image.utils";

const normalizeModel = (model) => (model || "").trim().toLowerCase();

// Resolve a fixture-relative slot into an absolute world position that rests on
// the fixture's measured top surface.
const slotToWorld = (fixture, slot) => {
  const [fx, fy, fz] = fixture.position;
  const [dx, dy, dz] = slot;
  return [fx + dx, fy + fixture.surfaceY + dy, fz + dz];
};

// Map catalog products onto fixture slots by their unique shop3dModel file name.
// The GLB rendered is the product's own shop3dModel. Products without a model
// are never matched; unmatched slots are warned and dropped.
export const resolveProductInstances = (products, fixtures, slots) => {
  const byModel = new Map(
    products
      .filter((product) => normalizeModel(product.shop3dModel))
      .map((product) => [normalizeModel(product.shop3dModel), product])
  );
  const byId = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
  return slots
    .map((slot) => {
      const product = byModel.get(normalizeModel(slot.model));
      const fixture = byId.get(slot.fixtureId);
      if (!product) {
        console.warn(`[shop3d] No product matched model "${slot.model}"`);
        return null;
      }
      if (!fixture) {
        console.warn(`[shop3d] No fixture matched id "${slot.fixtureId}"`);
        return null;
      }
      return {
        product,
        glb: product.shop3dModel,
        position: slotToWorld(fixture, slot.slot),
        rotationY: slot.rotationY || 0,
      };
    })
    .filter(Boolean);
};

// Resolve decorative accessory props onto fixture surfaces (no catalog product).
export const resolveAccessoryPlacements = (fixtures, placements) => {
  const byId = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
  return placements
    .map((placement) => {
      const fixture = byId.get(placement.fixtureId);
      if (!fixture) {
        console.warn(`[shop3d] No fixture matched id "${placement.fixtureId}"`);
        return null;
      }
      return {
        glb: placement.glb,
        position: slotToWorld(fixture, placement.slot),
        rotationY: placement.rotationY || 0,
      };
    })
    .filter(Boolean);
};

export const getLabelTextureUrl = (product) => getOptimizedImageUrl(product?.image, "card");
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd jagerthejagershopV3.0 && rtk vitest run src/utils/shop3d.utils.test.js`
Expected: PASS (all `resolveProductInstances`, `resolveAccessoryPlacements`, `getLabelTextureUrl` tests green).

- [ ] **Step 5: Commit**

```bash
rtk git add jagerthejagershopV3.0/src/utils/shop3d.utils.js jagerthejagershopV3.0/src/utils/shop3d.utils.test.js
rtk git commit -m "feat(fe): resolve 3D products by shop3dModel; drop dead resolveBottleInstances"
```

---

### Task 5: Reshape `PRODUCT_SLOTS` to reference `model`

**Files:**
- Modify: `jagerthejagershopV3.0/src/utils/shop3d.config.js:32-45`

**Interfaces:**
- Consumes: nothing new.
- Produces: `PRODUCT_SLOTS` entries shaped `{ model, fixtureId, slot, rotationY? }`, where `model` matches a product's `shop3dModel` and the unique file names agree with the backfill script's `MODEL_BY_NAME` values (Task 3).

- [ ] **Step 1: Replace the `PRODUCT_SLOTS` block**

In `shop3d.config.js`, replace the `PRODUCT_SLOTS` array (lines 32-45) with:

```js
// Products slotted onto fixtures. `model` is the product's unique shop3dModel
// GLB file name (see backfill MODEL_BY_NAME); the resolver renders that GLB.
// `slot` is [dx, dy, dz] relative to the fixture's surface.
export const PRODUCT_SLOTS = [
  // 700ml family across the eye-level shelf (surfaceY 1.135).
  { model: "jager-original-700.glb", fixtureId: "shelfMain", slot: [-0.4, 0, 0.12] },
  { model: "jager-original-1000.glb", fixtureId: "shelfMain", slot: [0.0, 0, 0.12] },
  { model: "jager-orange-1000.glb", fixtureId: "shelfMain", slot: [0.4, 0, 0.12] },
  // Lower shelf (0.655 → dy = 0.655 - 1.135 = -0.48).
  { model: "jager-original-200.glb", fixtureId: "shelfMain", slot: [-0.4, -0.48, 0.12] },
  { model: "jager-original-de-700.glb", fixtureId: "shelfMain", slot: [0.4, -0.48, 0.12] },
  // Minis inside the wine cabinet.
  { model: "jager-original-20.glb", fixtureId: "wineCabinet", slot: [-0.25, 0, 0.08] },
  { model: "jager-original-de-100.glb", fixtureId: "wineCabinet", slot: [0.25, 0, 0.08] },
];
```

- [ ] **Step 2: Run the full frontend test suite to confirm nothing else broke**

Run: `cd jagerthejagershopV3.0 && rtk vitest run`
Expected: PASS across the suite (shop3d utils + existing tests).

- [ ] **Step 3: Commit**

```bash
rtk git add jagerthejagershopV3.0/src/utils/shop3d.config.js
rtk git commit -m "feat(fe): PRODUCT_SLOTS reference shop3dModel instead of name+glb"
```

---

### Task 6: Add `shop3dModel` input to the admin product form

**Files:**
- Modify: `jagerthejagershopV3.0/src/components/admin-product-form/admin-product-form.component.jsx:8-17` (emptyProduct)
- Modify: `jagerthejagershopV3.0/src/components/admin-product-form/admin-product-form.component.jsx:120-135` (form body)

**Interfaces:**
- Consumes: `product.shop3dModel` via existing `handleChange`.
- Produces: `shop3dModel` in the submitted `FormData` (already carried — it is not in the excluded-keys list at line 93).

- [ ] **Step 1: Add `shop3dModel` to `emptyProduct`**

In `admin-product-form.component.jsx`, update `emptyProduct` (lines 8-17) to include the field:

```js
const emptyProduct = {
  name: "",
  vol: "",
  price: "",
  priceInInteger: 0,
  stock: 0,
  soldAmount: 0,
  category: "",
  isBestSeller: false,
  shop3dModel: "",
};
```

- [ ] **Step 2: Add the input to the form**

In the same file, immediately after the best-seller checkbox `<label>` (currently line 135) and before the product-image `<label>` (line 136), insert:

```jsx
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-heading text-xs font-bold uppercase tracking-widest text-mainOrange">{t("shop3dModel")}</span>
        <input className="border border-white/15 bg-[#14231d] px-3 py-2 text-cream outline-none focus:ring-2 focus:ring-mainOrange" name="shop3dModel" value={product.shop3dModel ?? ""} onChange={handleChange} type="text" placeholder="e.g. jager-original-700.glb" />
      </label>
```

- [ ] **Step 3: Add the `shop3dModel` label to both locale dictionaries**

Find the locale files and add a `shop3dModel` key. First locate them:

Run: `cd jagerthejagershopV3.0 && rtk grep "\"productName\":" src`
Expected: shows the locale file(s) (e.g. `src/context/locale.context.jsx` or a translations file) where `productName` is defined.

For each locale object that defines `productName`, add a sibling entry. English: `shop3dModel: "3D Model File"`. Vietnamese: `shop3dModel: "Tệp mô hình 3D"`. (Match the exact quoting/style used by the neighbouring keys in that file.)

- [ ] **Step 4: Build to confirm the form compiles**

Run: `cd jagerthejagershopV3.0 && rtk vitest run src/components/admin-product-form 2>/dev/null; rtk next build 2>/dev/null || npx vite build`
Expected: build succeeds (no missing-import/JSX errors). If there is no admin-form test, the build is the gate.

- [ ] **Step 5: Commit**

```bash
rtk git add jagerthejagershopV3.0/src/components/admin-product-form/admin-product-form.component.jsx
rtk git add jagerthejagershopV3.0/src/context/locale.context.jsx
rtk git commit -m "feat(fe): admin product form supports shop3dModel"
```

---

## Self-Review

**Spec coverage:**
- Schema field `shop3dModel` (default "", no index) → Task 1. ✓
- Controller normalizer trims/omits blank → Task 2. ✓
- Backfill script (migrateLegacyAssetImages pattern) → Task 3. ✓
- Slot config drops glb/productName → `model` → Task 5. ✓
- Resolver matches by shop3dModel, renders product.shop3dModel, skips empty, warns unmatched → Task 4. ✓
- `resolveBottleInstances` (dead) removed → Task 4. ✓
- product-bottle.component.jsx unchanged (renders `instance.glb`) → confirmed, no task needed. ✓
- Admin form input + emptyProduct → Task 6. ✓
- Tests: match by shop3dModel, skip empty, warn unmatched, rename regression → Task 4 Step 1. ✓
- Empty/unmatched skip behavior → covered in Task 4 tests + resolver. ✓

**Placeholder scan:** No TBD/TODO; all code shown in full. Task 6 Step 3 locates locale files by grep (exact path not assumed) — this is a lookup step, not a placeholder, because the label text and keys are specified verbatim.

**Type consistency:** `shop3dModel` (field), `slot.model` (config key), `MODEL_BY_NAME` file names shared between Task 3 and Task 5 — verified identical: `jager-original-700.glb`, `jager-original-1000.glb`, `jager-orange-1000.glb`, `jager-original-200.glb`, `jager-original-de-700.glb`, `jager-original-20.glb`, `jager-original-de-100.glb`. Resolver returns `{ product, glb, position, rotationY }` — unchanged shape that `ProductBottle` already consumes.

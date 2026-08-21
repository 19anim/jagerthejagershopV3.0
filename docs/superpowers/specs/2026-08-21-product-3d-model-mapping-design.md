# Product → 3D Model Mapping — Design

**Date:** 2026-08-21
**Status:** Approved for planning

## Problem

The 3D shop (`src/components/shop3d/`) currently decides which 3D bottle a
product renders as, and where it sits, through a hardcoded frontend config
(`PRODUCT_SLOTS` in `src/utils/shop3d.config.js`). Each slot carries a `glb`
file name and matches a product by its **display name** string
(`normalizeName(product.name)` in `src/utils/shop3d.utils.js`).

Two problems:

1. **The model choice lives in frontend config, not on the product.** Assigning
   a 3D model to a product means editing code, not editing the product.
2. **Matching by `name` is brittle.** Renaming a product in the DB silently
   breaks its 3D placement (`console.warn "No product matched slot"`).

## Decision

Add a single attribute to the product document:

```js
// product.model.js
shop3dModel: {
  type: String,
  default: "",   // e.g. "jager-original-700.glb"; empty = not shown in 3D shop
}
```

Design rules (decided with the user):

- **One product → one unique GLB.** Each product's `shop3dModel` is a distinct
  GLB file name. Models are not shared across products.
- **Each GLB contains exactly one product node.** No multi-size nodes, no
  `vol`-based node selection, no runtime scaling. One model = one product at its
  real modeled size. (`vol` remains the catalog capacity field; it is not used
  by the 3D size logic.)
- Because `shop3dModel` is unique per product, it doubles as the **stable
  identity link** between a DB product and its physical slot in the scene. This
  is what replaces the brittle name match.
- **No DB uniqueness index.** Uniqueness is a maintained convention, not a
  schema constraint — avoids migration risk from any duplicate legacy data and
  keeps empty `""` values unconstrained.
- **Empty / unmatched models are skipped.** A product with `shop3dModel === ""`
  simply does not appear in the 3D shop. A slot whose `model` resolves to no
  product is skipped with a `console.warn` (same robustness as today).

## Architecture

### Data flow (after)

```
Product doc { name, vol, shop3dModel: "jager-original-700.glb", ... }
        │  (matched by shop3dModel, NOT name)
        ▼
PRODUCT_SLOTS slot { model: "jager-original-700.glb", fixtureId, slot: [dx,dy,dz] }
        │  resolveProductInstances(products, fixtures, slots)
        ▼
instance { product, glb: product.shop3dModel, position, rotationY }
        ▼
<ProductBottle> renders the GLB (single node) with the product's label texture
```

The slot config stops owning the GLB name and stops identifying products by
display name. A slot now says only: *"the product whose model is X sits at this
fixture/offset."*

## Components & Changes

### Backend — `jagerthejagershopV3.0_BE`

1. **`src/model/product.model.js`** — add the `shop3dModel` string field
   (`default: ""`, no index).
2. **`src/app/controllers/products.controller.js`** — in
   `normalizeProductFields`, trim `shop3dModel`, and `delete` it when blank so an
   empty submit does not clobber an existing value on edit. The existing
   `{ ...body }` spread already carries the field through both `addAProduct` and
   `editAProduct`; no route or validation changes are required.
3. **`src/scripts/backfillShop3dModel.js`** (new) — one-off migration mirroring
   the existing `src/scripts/migrateLegacyAssetImages.js` pattern. Reads the
   current product→glb pairing from the legacy `PRODUCT_SLOTS` map and writes a
   unique `shop3dModel` onto each matching product so nothing breaks on rollout.
   (Legacy slots reuse `bottle-herbal.glb` across products; the backfill assigns
   a unique file name per product — the new per-product GLB files are produced
   separately as 3D assets. Where a real per-product GLB does not yet exist, the
   backfill sets the value it will eventually have; those products stay hidden
   from the 3D shop until the asset lands, per the skip rule.)

### Frontend — `jagerthejagershopV3.0`

4. **`src/utils/shop3d.config.js`** — `PRODUCT_SLOTS` entries change shape from
   `{ productName, glb, fixtureId, slot }` to `{ model, fixtureId, slot }`. The
   `glb` and `productName` fields collapse into the single `model` reference.
5. **`src/utils/shop3d.utils.js`** — `resolveProductInstances` builds its lookup
   `Map` keyed by `product.shop3dModel` (skipping products with empty
   `shop3dModel`) instead of `normalizeName(product.name)`. For each slot it
   matches `slot.model`, and returns `glb: product.shop3dModel`. Unmatched slots
   `console.warn` and are filtered out. (`resolveBottleInstances`, the older
   absolute-position resolver, is updated the same way or removed if unused —
   verify usage during planning.)
6. **`src/components/shop3d/product-bottle.component.jsx`** — no functional
   change; it already renders `instance.glb` as a single node with the product
   label. Confirm it reads the glb from the resolved instance (it does).

### Admin — `jagerthejagershopV3.0`

7. **`src/components/admin-product-form/admin-product-form.component.jsx`** — add
   a `shop3dModel` text input and include `shop3dModel: ""` in `emptyProduct`.
   The existing `handleChange` and `FormData` submit loop carry it through
   unchanged (it is not in the excluded-keys list). A future iteration can turn
   the input into a dropdown of known GLB files; out of scope now.

## Error Handling

- Product with empty `shop3dModel`: excluded from the lookup map → never placed →
  no error, optionally not warned (it is a valid "not in 3D shop" state).
- Slot referencing a `model` with no matching product: `console.warn` and skip.
- Slot referencing a `fixtureId` with no matching fixture: existing
  `console.warn` and skip (unchanged).

## Testing

- **`src/utils/shop3d.utils.test.js`** (exists) — update/extend:
  - resolves a product by `shop3dModel` and returns `glb === product.shop3dModel`.
  - skips products with empty `shop3dModel`.
  - warns + skips a slot whose `model` matches no product.
  - renaming a product's `name` does not affect resolution (regression guard for
    the original brittleness).
- Backfill script: a small unit/integration check that each targeted product
  receives the expected unique `shop3dModel`, and products outside the map are
  left untouched (`""`).

## Out of Scope (YAGNI)

- Admin dropdown of known GLBs (text input for now).
- Moving fixture/slot placement coordinates into the DB (slots stay in frontend
  config).
- Multi-size GLB nodes / runtime scaling (each GLB is single-node, single-size).
- DB uniqueness index on `shop3dModel`.

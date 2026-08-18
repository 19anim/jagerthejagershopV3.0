# 3D Shop Experience — Design Spec

**Date:** 2026-08-18
**Project:** jagerthejagershopV3.0
**Status:** Approved design → ready for implementation plan

## Goal

Add an optional 3D storefront experience alongside the existing classic React
site. Users choose Classic or 3D on entry, can toggle anytime, and in 3D mode
walk from an exterior storefront into a decorated interior where product bottles
and the cashier are clickable and wired to the real cart/checkout.

This document specifies **version 1** — a first version to review and iterate on.

## Scope (v1)

- Full scene: exterior storefront → click-to-enter → decorated interior.
- Mobile-tuned (touch controls, capped DPR, preloading).
- Curated bottle shelf using two product GLBs mapped to real catalog items.
- Clickable bottles (price/stock + add to cart) and cashier (checkout).

Out of scope for v1: using the remaining product GLBs (flask, gift-box,
jager_bottle_tall, drinking-glass, jigger, pourer, shaker), neck labels,
multi-room navigation, in-3D product browsing by category.

## Tech

- Add dependencies: `three`, `@react-three/fiber`, `@react-three/drei`.
- The entire 3D route is code-split with `React.lazy` + `Suspense` so classic
  users never download Three.js. Suspense fallback reuses the existing
  `<LoadingSpinner>` component.

## Architecture & Routing

- **New route:** `/:locale/shop3d` → `<Shop3DPage>` (lazy-loaded), added to
  `LocalizedRoutes` in `src/App.jsx`.
- **Mode state:** a `useShopMode` hook backed by `localStorage` key `shop_mode`
  with values `"classic" | "3d"` (follows existing localStorage patterns used by
  the age gate and cart).
  - **First visit (no stored value):** a full-screen splash chooser overlays the
    homepage with two cards — Classic / 3D Store.
  - **After choice:** value persisted. A **persistent navbar toggle** lets users
    switch modes anytime. Selecting 3D navigates to `/:locale/shop3d`; selecting
    Classic returns to `HomePage`.
- Classic experience is unchanged.

## Scene Structure

- `<Shop3DPage>` (DOM layer):
  - WebGL-support check; if unsupported, render an accessible fallback message
    with a "Use classic version" button.
  - HUD overlay (React DOM above the canvas): cart count, "Exit to classic"
    button, and a help hint. Styled with the Tailwind theme (cream / mainOrange).
- `<SceneCanvas>` (R3F `<Canvas>`):
  - `<Suspense>` around GLB loading (`useGLTF`, with `useGLTF.preload` on route
    entry). Lighting via `<Environment>` + lights.
  - Constrained `OrbitControls` (limited zoom, pan, polar angle).
  - Camera / scene state machine with an explicit **`exterior`** starting state:
    the user always begins **outside** the store, viewing the storefront. They
    must interact with the front store to enter.
    - **Entering:** clicking the entrance door plays a **door-open animation**
      (the door mesh rotates/swings open), after which the camera moves through
      the doorway into the interior (`exterior → entering → interior`), animated
      with a drei camera transition.
    - Before entry the interior is not the active view; the entrance door shows a
      hover highlight + pointer cursor and an optional "Open door" hint so the
      interaction is discoverable.
  - Mobile: dampened touch controls, `dpr={[1, 2]}` cap.
- `<ExteriorScene>`: models from `01 Storefront exterior` (facade,
  entrance-door, display-window, signboard, street-lamp, planter,
  sidewalk-base).
  - **Entrance door (verified):** `entrance-door.glb` has a hinge side
    (`stile_hinge`, `hinge_a/b/c`) and an opening side (`stile_lock`, `pull_bar`),
    but **no baked animation**. The door-open effect is done in code by animating
    the door group's rotation around the hinge axis (e.g. react-spring / drei),
    then advancing the scene state to `interior`.
  - **Store logo slots (verified):** both models carry a `slot_face` material and
    no embedded image, so the shop logo (`src/assets/logo.png`) is applied as a
    texture at runtime:
    - `signboard.glb` → node **`logo_slot`**.
    - `street-lamp.glb` → node **`banner_slot`** (with `banner_slot_backer`).
- `<InteriorScene>`: structure from `02 Interior structure` (room-shell,
  liquor-shelf-bay, specials-podium, accessory-stand, ceiling-spotlight),
  decorated with `05 Ambience` (floor-rug, framed-art, neon-sign, oak-barrel,
  potted-plant, wooden-crate, inspect-pedestal). Hosts `<ProductBottle>`
  instances and `<Fixtures>`.

## Product Mapping & Labels

A config file maps product GLBs to real catalog products by display name:

| GLB | Products |
| --- | --- |
| `bottle-herbal.glb` | Jagermeister Original nội địa Đức 700ml, Jagermeister Original 700ml, Jagermeister Original 200ml, Jagermeister Original 1000ml, Jagermeister Orange 1000ml |
| `bottle-herbal-mini.glb` | Jagermeister Original 20ml, Jagermeister Original nội địa Đức 100ml |

- Products are resolved at runtime from `/api/products/getAllProducts` by matching
  the display names in the config. Unmatched entries are skipped gracefully (a
  console warning, no crash).
- Each bottle instance is placed in a shelf slot.

### Label textures (verified against the GLB files)

Both GLBs were inspected directly. Findings:

- `bottle-herbal.glb` — materials `glass_smoked`, `dark`, `metal_gold`,
  **`slot_face`**; nodes include **`label_slot`**, `label_slot_back`,
  `label_slot_neck`, `emboss_slot_left/right`. No embedded images.
- `bottle-herbal-mini.glb` — materials `glass_smoked`, `dark`, `metal_gold`,
  **`slot_face`**; node **`label_slot`**. No embedded images.

Both models are purpose-built to receive a label texture, so **no floating-plane
fallback is needed** for them.

Implementation:

- Apply each product's image (`product.image` via
  `getOptimizedImageUrl(image, "card")`) as a texture on the `slot_face`
  material / `label_slot` mesh at runtime.
- `bottle-herbal.glb`'s `label_slot_neck` keeps its default material in v1
  (neck labels deferred).

### Per-model image needs (v1 models)

| Model | Needs runtime image? |
| --- | --- |
| `bottle-herbal.glb` | Yes — product image on `label_slot` / `slot_face` |
| `bottle-herbal-mini.glb` | Yes — product image on `label_slot` / `slot_face` |
| `signboard.glb` | Yes — shop logo on `logo_slot` / `slot_face` |
| `street-lamp.glb` | Yes — shop logo on `banner_slot` / `slot_face` |
| `01 Storefront exterior/*` (other) | No — decorative geometry/materials only |
| `02 Interior structure/*` | No |
| `04 Interactive fixtures/*` | No (interactive but no product image) |
| `05 Ambience/*` | No |

The remaining `03 Products` GLBs are unused in v1, so they need no image work now.

## Interactions (raycaster / pointer)

- **Bottle click** → a 3D-anchored panel (drei `<Html>`) showing name, price
  (`priceInInteger`), and stock, plus an "Add to cart" button that calls
  `addItemToCart(product, 1)` from `CartContext`.
- **Cashier / POS terminal click** → navigate to `/:locale/cartCheckout`
  (checkout flow).
- **Shopping basket click** → open the cart dropdown via `toggleIsCartOpen`.
- **Hover** → emissive highlight tint + pointer cursor on all interactables.

## Data Flow

1. `<Shop3DPage>` mounts → fetch products (`/api/products/getAllProducts`).
2. Config resolves GLB → product objects by name.
3. Bottles render with label textures from product images.
4. Clicks call existing `CartContext` methods; cart state and checkout are
   unchanged from classic mode (shared context, shared localStorage cart).

## Error Handling & Fallbacks

- No WebGL → accessible fallback + classic button.
- GLB load failure → Suspense boundary keeps spinner; a per-model error boundary
  logs and hides the failed model rather than crashing the scene.
- Product name not matched → skip that bottle, warn in console.
- Missing/invalid product image → `getOptimizedImageUrl` already falls back to
  the logo.

## Testing

- Unit: `useShopMode` (localStorage read/write, default first-visit behavior),
  GLB→product name resolution (matches, misses), label-texture URL builder.
- Component: selector splash renders and persists choice; navbar toggle switches
  mode; WebGL-unsupported fallback renders.
- Manual/visual: exterior→interior transition, bottle click → add to cart,
  cashier click → checkout, mobile touch controls.

## Open Items for Later Iteration

- Neck labels, remaining product GLBs, richer interior interactions, category
  browsing in 3D, performance profiling on low-end mobile.

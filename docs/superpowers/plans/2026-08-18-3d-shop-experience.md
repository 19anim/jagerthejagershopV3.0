# 3D Shop Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional Three.js 3D storefront experience alongside the existing classic React site, with a persisted Classic/3D selector, a click-to-open exterior door, a decorated interior, and clickable product bottles + cashier wired to the existing cart and checkout.

**Architecture:** A new lazy-loaded route `/:locale/shop3d` renders the 3D experience with `@react-three/fiber` + `@react-three/drei`, code-split so classic users never download Three.js. A `useShopMode` hook (localStorage-backed, same pattern as the age gate) drives a first-visit splash selector on the homepage and a persistent navbar toggle. Product bottles are curated: two GLB models are mapped by display name to real backend products, textured at runtime with each product's Cloudinary image on the model's `slot_face`/`label_slot`, and clicking them calls the existing `CartContext.addItemToCart`.

**Tech Stack:** React 18, Vite 5, react-router-dom 6, Tailwind 3.4, axios, vitest 4 + Testing Library, `three` + `@react-three/fiber` + `@react-three/drei` (new).

## Global Constraints

- Work in `D:\ReactJS\jagershop\jagerthejagershopV3.0` on branch `main`. No new branch, no PR. Commit directly to `main`.
- Prefix every shell command with `rtk` (per user global CLAUDE.md), including inside `&&` chains.
- Classic experience must remain byte-for-byte behaviorally unchanged when 3D code is absent from the render path.
- The entire Three.js/3D bundle MUST be code-split via `React.lazy` so classic-mode users never download it.
- localStorage key for mode: `shop_mode`, values exactly `"classic"` or `"3d"`. Reuse existing keys' style (`age_confirmed`, `shop_locale`, `cart_items`).
- All user-facing strings go through `useLocale().t(key)` with both `vi` and `en` entries added to `src/context/locale.context.jsx`. Default locale is `vi`.
- Cart integration MUST use existing `CartContext` methods only: `addItemToCart(product, quantity)`, `toggleIsCartOpen()`, `cartItems`. Do not modify cart internals.
- Product fetch endpoint: `axios.get(apiUrl("/api/products/getAllProducts"))`. Product image field is `product.image`; optimize via `getOptimizedImageUrl(image, "card")` from `src/utils/image.utils.js`.
- Theme colors (Tailwind): `mainGreen`, `cream`, `mainOrange`, `warmGold`, `ink`. Reuse `brand-button` / `brand-button-outline` / `brand-kicker` classes.
- Tests: vitest with globals enabled (no need to import `describe/it/expect`, but existing files do import them — follow the file you're editing). Component tests wrap in `<BrowserRouter><LocaleProvider>…`. Run a single file with `rtk npx vitest run <path>`.

## File Structure

**New files:**
- `src/utils/webgl.utils.js` — `isWebGLAvailable()` boolean check.
- `src/utils/shop3d.assets.js` — maps GLB filename → bundled URL via `import.meta.glob` (handles folder names with spaces).
- `src/utils/shop3d.config.js` — static config: which GLB backs which product names, shelf slot placements, logo slot targets.
- `src/utils/shop3d.utils.js` — `resolveBottleInstances(products, config)`, `getLabelTextureUrl(product)`.
- `src/utils/shop3d.utils.test.js` — unit tests for the two utils above.
- `src/hooks/useShopMode.hook.jsx` — `useShopMode()` hook + `SHOP_MODE` constants.
- `src/hooks/useShopMode.test.jsx` — hook tests.
- `src/components/shop-mode-selector/shop-mode-selector.component.jsx` — first-visit splash chooser.
- `src/components/shop-mode-selector/shop-mode-selector.test.jsx` — selector tests.
- `src/components/shop-mode-toggle/shop-mode-toggle.component.jsx` — navbar Classic/3D toggle.
- `src/pages/shop3d.page.jsx` — `Shop3DPage`: WebGL guard + data fetch + HUD + `<Canvas>` host (default export, lazy target).
- `src/components/shop3d/scene-canvas.component.jsx` — R3F `<Canvas>`, lights, controls, scene-state machine.
- `src/components/shop3d/exterior-scene.component.jsx` — storefront + click-to-open door.
- `src/components/shop3d/interior-scene.component.jsx` — room, ambience, shelves host.
- `src/components/shop3d/product-bottle.component.jsx` — one clickable, labeled bottle + price `<Html>` panel.
- `src/components/shop3d/fixtures.component.jsx` — cashier/POS/basket clickable fixtures.
- `src/components/shop3d/glb-model.component.jsx` — thin `useGLTF` wrapper with error boundary fallback.
- `src/components/shop3d/shop3d-hud.component.jsx` — DOM overlay (cart count, exit, help).

**Modified files:**
- `package.json` — add three/fiber/drei deps (via install).
- `src/context/locale.context.jsx` — add translation keys (vi + en).
- `src/App.jsx` — add lazy `shop3d` route inside `LocalizedRoutes`.
- `src/pages/homePage.page.jsx` — render `<ShopModeSelector />` splash on first visit.
- `src/components/navigator/navigator.component.jsx` — add `<ShopModeToggle />`.

---

## Task 1: Install 3D dependencies

**Files:**
- Modify: `package.json` (dependencies added by npm)

**Interfaces:**
- Produces: `three`, `@react-three/fiber`, `@react-three/drei` importable in the app.

- [ ] **Step 1: Install the three packages**

Run:
```bash
rtk npm install three@^0.160.0 @react-three/fiber@^8.15.0 @react-three/drei@^9.96.0
```
Expected: install completes; `package.json` `dependencies` now lists `three`, `@react-three/fiber`, `@react-three/drei`.

- [ ] **Step 2: Verify the app still builds**

Run: `rtk npm run build`
Expected: build succeeds with no errors (Three.js not yet imported anywhere, so bundle unaffected).

- [ ] **Step 3: Commit**

```bash
rtk git add package.json package-lock.json && rtk git commit -m "chore: add three, react-three-fiber, drei for 3D shop"
```

---

## Task 2: WebGL availability util

**Files:**
- Create: `src/utils/webgl.utils.js`
- Test: `src/utils/webgl.utils.test.js`

**Interfaces:**
- Produces: `isWebGLAvailable(): boolean` — true when a WebGL context can be created.

- [ ] **Step 1: Write the failing test**

Create `src/utils/webgl.utils.test.js`:
```js
import { describe, expect, it, vi } from "vitest";
import { isWebGLAvailable } from "./webgl.utils";

describe("isWebGLAvailable", () => {
  it("returns true when a webgl context is returned", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({});
    expect(isWebGLAvailable()).toBe(true);
  });

  it("returns false when no context can be created", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(isWebGLAvailable()).toBe(false);
  });

  it("returns false when getContext throws", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => {
      throw new Error("no webgl");
    });
    expect(isWebGLAvailable()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx vitest run src/utils/webgl.utils.test.js`
Expected: FAIL — cannot resolve `./webgl.utils`.

- [ ] **Step 3: Write minimal implementation**

Create `src/utils/webgl.utils.js`:
```js
export const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(context);
  } catch (_error) {
    return false;
  }
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx vitest run src/utils/webgl.utils.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
rtk git add src/utils/webgl.utils.js src/utils/webgl.utils.test.js && rtk git commit -m "feat: add isWebGLAvailable util"
```

---

## Task 3: GLB asset URL map

**Files:**
- Create: `src/utils/shop3d.assets.js`

**Interfaces:**
- Produces: `getGlbUrl(fileName: string): string` — returns the bundled URL for a GLB by its base filename (e.g. `"entrance-door.glb"`). Throws if unknown.
- Produces: `GLB_URLS: Record<string,string>` — filename → url map.

- [ ] **Step 1: Implement the asset map**

Create `src/utils/shop3d.assets.js`:
```js
// import.meta.glob handles the folder names that contain spaces, and returns
// hashed bundle URLs. Keyed by the raw path, we re-key by base filename.
const modules = import.meta.glob("../assets/jager-3d-glb/**/*.glb", {
  eager: true,
  query: "?url",
  import: "default",
});

export const GLB_URLS = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [path.split("/").pop(), url])
);

export const getGlbUrl = (fileName) => {
  const url = GLB_URLS[fileName];
  if (!url) throw new Error(`Unknown GLB asset: ${fileName}`);
  return url;
};
```

- [ ] **Step 2: Verify it compiles via build**

Run: `rtk npm run build`
Expected: build succeeds; no unresolved-import errors. (No unit test — `import.meta.glob` is a Vite build-time feature not available under the vitest jsdom transform without extra setup.)

- [ ] **Step 3: Commit**

```bash
rtk git add src/utils/shop3d.assets.js && rtk git commit -m "feat: add GLB asset URL map for 3D shop"
```

---

## Task 4: Scene config + product resolution utils

**Files:**
- Create: `src/utils/shop3d.config.js`
- Create: `src/utils/shop3d.utils.js`
- Test: `src/utils/shop3d.utils.test.js`

**Interfaces:**
- Consumes: `getOptimizedImageUrl` from `src/utils/image.utils.js`; product shape `{ _id, name, image, priceInInteger, stock, slug }`.
- Produces (`shop3d.config.js`):
  - `BOTTLE_PLACEMENTS: Array<{ productName: string, glb: string, position: [number,number,number], rotationY?: number }>`
  - `LOGO_SLOTS: Array<{ glb: string, node: string }>`
- Produces (`shop3d.utils.js`):
  - `resolveBottleInstances(products, placements): Array<{ product, glb, position, rotationY }>` — matches each placement's `productName` (case-insensitive, trimmed) to a product; skips unmatched with a `console.warn`.
  - `getLabelTextureUrl(product): string` — optimized image URL for the label, or fallback logo URL.

- [ ] **Step 1: Write the config**

Create `src/utils/shop3d.config.js`:
```js
// Curated shelf: two herbal-bottle GLBs mapped to real catalog products by name.
// Verified GLB slots: bottle-herbal.glb & bottle-herbal-mini.glb both expose a
// `slot_face` material on a `label_slot` node for the product label texture.
export const BOTTLE_PLACEMENTS = [
  { productName: "Jagermeister Original nội địa Đức 700ml", glb: "bottle-herbal.glb", position: [-1.8, 0.9, -1.2] },
  { productName: "Jagermeister Original 700ml", glb: "bottle-herbal.glb", position: [-0.9, 0.9, -1.2] },
  { productName: "Jagermeister Original 200ml", glb: "bottle-herbal.glb", position: [0.0, 0.9, -1.2] },
  { productName: "Jagermeister Original 1000ml", glb: "bottle-herbal.glb", position: [0.9, 0.9, -1.2] },
  { productName: "Jagermeister Orange 1000ml", glb: "bottle-herbal.glb", position: [1.8, 0.9, -1.2] },
  { productName: "Jagermeister Original 20ml", glb: "bottle-herbal-mini.glb", position: [-0.5, 0.9, -0.2] },
  { productName: "Jagermeister Original nội địa Đức 100ml", glb: "bottle-herbal-mini.glb", position: [0.5, 0.9, -0.2] },
];

// Shop logo applied to these exterior slots (verified nodes/materials).
export const LOGO_SLOTS = [
  { glb: "signboard.glb", node: "logo_slot" },
  { glb: "street-lamp.glb", node: "banner_slot" },
];

// The mesh material name that receives an image texture across GLB slots.
export const SLOT_MATERIAL_NAME = "slot_face";
```

- [ ] **Step 2: Write the failing test**

Create `src/utils/shop3d.utils.test.js`:
```js
import { describe, expect, it, vi } from "vitest";
import { resolveBottleInstances, getLabelTextureUrl } from "./shop3d.utils";

const products = [
  { _id: "p1", name: "Jagermeister Original 700ml", image: "https://res.cloudinary.com/x/upload/v1/a.jpg", priceInInteger: 500, stock: 3, slug: "jager-700" },
  { _id: "p2", name: "Jagermeister Original 20ml", image: "", priceInInteger: 100, stock: 5, slug: "jager-20" },
];

const placements = [
  { productName: "jagermeister original 700ml", glb: "bottle-herbal.glb", position: [0, 0, 0] },
  { productName: "Jagermeister Original 20ml", glb: "bottle-herbal-mini.glb", position: [1, 0, 0] },
  { productName: "Does Not Exist", glb: "bottle-herbal.glb", position: [2, 0, 0] },
];

describe("resolveBottleInstances", () => {
  it("matches placements to products case-insensitively and attaches metadata", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = resolveBottleInstances(products, placements);
    expect(result).toHaveLength(2);
    expect(result[0].product._id).toBe("p1");
    expect(result[0].glb).toBe("bottle-herbal.glb");
    expect(result[0].position).toEqual([0, 0, 0]);
    expect(result[1].product._id).toBe("p2");
    warn.mockRestore();
  });

  it("warns and skips placements with no matching product", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = resolveBottleInstances(products, placements);
    expect(result.some((instance) => instance.product.name === "Does Not Exist")).toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
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

- [ ] **Step 3: Run test to verify it fails**

Run: `rtk npx vitest run src/utils/shop3d.utils.test.js`
Expected: FAIL — cannot resolve `./shop3d.utils`.

- [ ] **Step 4: Write the implementation**

Create `src/utils/shop3d.utils.js`:
```js
import { getOptimizedImageUrl } from "./image.utils";

const normalizeName = (name) => (name || "").trim().toLowerCase();

export const resolveBottleInstances = (products, placements) => {
  const byName = new Map(products.map((product) => [normalizeName(product.name), product]));
  return placements
    .map((placement) => {
      const product = byName.get(normalizeName(placement.productName));
      if (!product) {
        console.warn(`[shop3d] No product matched placement "${placement.productName}"`);
        return null;
      }
      return {
        product,
        glb: placement.glb,
        position: placement.position,
        rotationY: placement.rotationY || 0,
      };
    })
    .filter(Boolean);
};

export const getLabelTextureUrl = (product) => getOptimizedImageUrl(product?.image, "card");
```

- [ ] **Step 5: Run test to verify it passes**

Run: `rtk npx vitest run src/utils/shop3d.utils.test.js`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
rtk git add src/utils/shop3d.config.js src/utils/shop3d.utils.js src/utils/shop3d.utils.test.js && rtk git commit -m "feat: add 3D shop scene config and product resolution utils"
```

---

## Task 5: useShopMode hook

**Files:**
- Create: `src/hooks/useShopMode.hook.jsx`
- Test: `src/hooks/useShopMode.test.jsx`

**Interfaces:**
- Produces:
  - `SHOP_MODE = { CLASSIC: "classic", THREE_D: "3d" }`
  - `SHOP_MODE_STORAGE_KEY = "shop_mode"`
  - `useShopMode(): { mode: string|null, hasChosen: boolean, setMode(mode): void }` — `mode` is `null` until a choice is stored; persists to localStorage.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useShopMode.test.jsx`:
```jsx
import { describe, expect, it, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useShopMode, SHOP_MODE, SHOP_MODE_STORAGE_KEY } from "./useShopMode.hook";

describe("useShopMode", () => {
  beforeEach(() => localStorage.clear());

  it("starts unchosen when nothing stored", () => {
    const { result } = renderHook(() => useShopMode());
    expect(result.current.mode).toBeNull();
    expect(result.current.hasChosen).toBe(false);
  });

  it("reads an existing stored mode", () => {
    localStorage.setItem(SHOP_MODE_STORAGE_KEY, SHOP_MODE.THREE_D);
    const { result } = renderHook(() => useShopMode());
    expect(result.current.mode).toBe("3d");
    expect(result.current.hasChosen).toBe(true);
  });

  it("persists a chosen mode", () => {
    const { result } = renderHook(() => useShopMode());
    act(() => result.current.setMode(SHOP_MODE.CLASSIC));
    expect(result.current.mode).toBe("classic");
    expect(localStorage.getItem(SHOP_MODE_STORAGE_KEY)).toBe("classic");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem(SHOP_MODE_STORAGE_KEY, "banana");
    const { result } = renderHook(() => useShopMode());
    expect(result.current.mode).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx vitest run src/hooks/useShopMode.test.jsx`
Expected: FAIL — cannot resolve `./useShopMode.hook`.

- [ ] **Step 3: Write the implementation**

Create `src/hooks/useShopMode.hook.jsx`:
```jsx
import { useCallback, useState } from "react";

export const SHOP_MODE = { CLASSIC: "classic", THREE_D: "3d" };
export const SHOP_MODE_STORAGE_KEY = "shop_mode";

const readStoredMode = () => {
  const stored = localStorage.getItem(SHOP_MODE_STORAGE_KEY);
  return stored === SHOP_MODE.CLASSIC || stored === SHOP_MODE.THREE_D ? stored : null;
};

export const useShopMode = () => {
  const [mode, setModeState] = useState(readStoredMode);

  const setMode = useCallback((nextMode) => {
    if (nextMode !== SHOP_MODE.CLASSIC && nextMode !== SHOP_MODE.THREE_D) return;
    localStorage.setItem(SHOP_MODE_STORAGE_KEY, nextMode);
    setModeState(nextMode);
  }, []);

  return { mode, hasChosen: mode !== null, setMode };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx vitest run src/hooks/useShopMode.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
rtk git add src/hooks/useShopMode.hook.jsx src/hooks/useShopMode.test.jsx && rtk git commit -m "feat: add useShopMode hook with localStorage persistence"
```

---

## Task 6: Translation keys for 3D shop

**Files:**
- Modify: `src/context/locale.context.jsx` (add keys to both `vi` and `en` objects)

**Interfaces:**
- Produces translation keys used by later tasks: `chooseExperience`, `chooseExperienceBody`, `classicMode`, `classicModeBody`, `threeDMode`, `threeDModeBody`, `enterClassic`, `enter3D`, `exitTo3D`, `exitToClassic`, `shop3dHelp`, `openDoor`, `webglUnsupported`, `webglUnsupportedBody`, `addToCart` (already exists), `shop3dLoading`.

- [ ] **Step 1: Add keys to the `vi` translations object**

In `src/context/locale.context.jsx`, inside the `vi: { … }` object, add before its closing `}` (after the `cancel: "Hủy",` line):
```js
    chooseExperience: "Chọn trải nghiệm",
    chooseExperienceBody: "Bạn muốn xem cửa hàng theo cách nào?",
    classicMode: "Phiên bản cổ điển",
    classicModeBody: "Duyệt sản phẩm theo cách quen thuộc.",
    threeDMode: "Cửa hàng 3D",
    threeDModeBody: "Bước vào cửa hàng 3D và tương tác trực tiếp.",
    enterClassic: "Vào bản cổ điển",
    enter3D: "Vào cửa hàng 3D",
    exitTo3D: "Chế độ 3D",
    exitToClassic: "Về bản cổ điển",
    shop3dHelp: "Kéo để xoay · Cuộn để phóng · Nhấp vào cửa để vào trong",
    openDoor: "Nhấp để mở cửa",
    webglUnsupported: "Trình duyệt không hỗ trợ 3D",
    webglUnsupportedBody: "Thiết bị của bạn không hỗ trợ WebGL. Vui lòng dùng phiên bản cổ điển.",
    shop3dLoading: "Đang tải cửa hàng 3D...",
```

- [ ] **Step 2: Add the same keys to the `en` translations object**

Inside the `en: { … }` object, add before its closing `}` (after the `cancel: "Cancel",` line):
```js
    chooseExperience: "Choose your experience",
    chooseExperienceBody: "How would you like to explore the shop?",
    classicMode: "Classic version",
    classicModeBody: "Browse products the familiar way.",
    threeDMode: "3D Store",
    threeDModeBody: "Step into the 3D store and interact directly.",
    enterClassic: "Enter classic",
    enter3D: "Enter 3D store",
    exitTo3D: "3D mode",
    exitToClassic: "Back to classic",
    shop3dHelp: "Drag to look · Scroll to zoom · Click the door to enter",
    openDoor: "Click to open the door",
    webglUnsupported: "3D not supported",
    webglUnsupportedBody: "Your device does not support WebGL. Please use the classic version.",
    shop3dLoading: "Loading the 3D store...",
```

- [ ] **Step 3: Verify build/lint**

Run: `rtk npm run lint`
Expected: PASS with no errors (valid JS object literals).

- [ ] **Step 4: Commit**

```bash
rtk git add src/context/locale.context.jsx && rtk git commit -m "feat: add i18n keys for 3D shop experience"
```

---

## Task 7: Shop mode selector splash

**Files:**
- Create: `src/components/shop-mode-selector/shop-mode-selector.component.jsx`
- Test: `src/components/shop-mode-selector/shop-mode-selector.test.jsx`

**Interfaces:**
- Consumes: `useShopMode` (Task 5), `SHOP_MODE`; `useLocale` for `t`; `useNavigate`/locale for routing.
- Produces: default-exported `<ShopModeSelector />`. Renders nothing when a mode is already chosen. On "Classic" → `setMode("classic")` (splash disappears). On "3D" → `setMode("3d")` then navigate to `/{locale}/shop3d`.

- [ ] **Step 1: Write the failing test**

Create `src/components/shop-mode-selector/shop-mode-selector.test.jsx`:
```jsx
import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ShopModeSelector from "./shop-mode-selector.component";
import { LocaleProvider } from "../../context/locale.context";
import { SHOP_MODE_STORAGE_KEY } from "../../hooks/useShopMode.hook";

const renderSelector = () =>
  render(
    <BrowserRouter>
      <LocaleProvider>
        <ShopModeSelector />
      </LocaleProvider>
    </BrowserRouter>
  );

describe("ShopModeSelector", () => {
  beforeEach(() => localStorage.clear());

  it("shows both choices on first visit", () => {
    renderSelector();
    expect(screen.getByText("Vào bản cổ điển")).toBeInTheDocument();
    expect(screen.getByText("Vào cửa hàng 3D")).toBeInTheDocument();
  });

  it("persists classic choice and hides the splash", () => {
    renderSelector();
    fireEvent.click(screen.getByText("Vào bản cổ điển"));
    expect(localStorage.getItem(SHOP_MODE_STORAGE_KEY)).toBe("classic");
    expect(screen.queryByText("Vào bản cổ điển")).not.toBeInTheDocument();
  });

  it("renders nothing when a mode was already chosen", () => {
    localStorage.setItem(SHOP_MODE_STORAGE_KEY, "classic");
    const { container } = renderSelector();
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx vitest run src/components/shop-mode-selector/shop-mode-selector.test.jsx`
Expected: FAIL — cannot resolve the component.

- [ ] **Step 3: Write the implementation**

Create `src/components/shop-mode-selector/shop-mode-selector.component.jsx`:
```jsx
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { useLocale } from "../../context/locale.context";
import { useShopMode, SHOP_MODE } from "../../hooks/useShopMode.hook";

const ShopModeSelector = () => {
  const { mode, setMode } = useShopMode();
  const { t, locale } = useLocale();
  const navigate = useNavigate();

  if (mode !== null) return null;

  const chooseClassic = () => setMode(SHOP_MODE.CLASSIC);
  const choose3D = () => {
    setMode(SHOP_MODE.THREE_D);
    navigate(`/${locale}/shop3d`);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#101a15]/95 p-5">
      <div className="w-full max-w-2xl border border-warmGold/50 bg-cream p-7 text-center text-ink shadow-2xl md:p-10">
        <img src={Logo} alt="JagerTheJager Shop" className="mx-auto mb-5 w-40" />
        <p className="brand-kicker mb-2">{t("chooseExperience")}</p>
        <p className="mx-auto mb-7 max-w-md text-sm leading-6 text-ink/70">{t("chooseExperienceBody")}</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={chooseClassic}
            className="flex-1 border border-warmGold/40 bg-white/60 p-5 text-left transition hover:border-mainOrange"
          >
            <span className="font-heading text-lg font-bold uppercase">{t("classicMode")}</span>
            <span className="mt-1 block text-xs text-ink/60">{t("classicModeBody")}</span>
            <span className="brand-button mt-4 inline-block">{t("enterClassic")}</span>
          </button>
          <button
            onClick={choose3D}
            className="flex-1 border border-warmGold/40 bg-white/60 p-5 text-left transition hover:border-mainOrange"
          >
            <span className="font-heading text-lg font-bold uppercase">{t("threeDMode")}</span>
            <span className="mt-1 block text-xs text-ink/60">{t("threeDModeBody")}</span>
            <span className="brand-button mt-4 inline-block">{t("enter3D")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopModeSelector;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx vitest run src/components/shop-mode-selector/shop-mode-selector.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
rtk git add src/components/shop-mode-selector && rtk git commit -m "feat: add first-visit shop mode selector splash"
```

---

## Task 8: Wire selector into HomePage

**Files:**
- Modify: `src/pages/homePage.page.jsx`

**Interfaces:**
- Consumes: `<ShopModeSelector />` (Task 7).

- [ ] **Step 1: Render the selector on the homepage**

Replace the entire contents of `src/pages/homePage.page.jsx` with:
```jsx
import BestSellerSlider from "../components/bestSeller-Slider/bestSeller-Slider.component";
import ShopModeSelector from "../components/shop-mode-selector/shop-mode-selector.component";

const HomePage = () => {
  return (
    <>
      <ShopModeSelector />
      <section className="mx-auto flex min-h-[360px] max-w-[1440px] flex-col items-center justify-center px-5 py-16 text-center text-cream md:min-h-[460px] md:py-24">
        <h1 className="text-[34px] font-extrabold leading-tight tracking-tight md:text-[80px]">
          JAGERTHEJAGER <span className="text-mainOrange">SHOP</span>.
        </h1>
        <p className="mt-3 text-[16px] font-medium text-cream/85 md:text-[22px]">
          Ở đây iem bán thuốc ho con hươu
        </p>
      </section>
      <BestSellerSlider />
    </>
  );
};

export default HomePage;
```

- [ ] **Step 2: Manual verification in dev server**

Run: `rtk npm run dev` and open `http://localhost:5173/vi` in a fresh session (clear localStorage first: DevTools → Application → Local Storage → clear).
Expected: The choose-experience splash appears over the homepage. Clicking "Vào bản cổ điển" dismisses it and shows the classic homepage. Reloading does not show the splash again. Stop the dev server (Ctrl+C) after verifying.

- [ ] **Step 3: Commit**

```bash
rtk git add src/pages/homePage.page.jsx && rtk git commit -m "feat: show shop mode selector on homepage first visit"
```

---

## Task 9: Navbar shop mode toggle

**Files:**
- Create: `src/components/shop-mode-toggle/shop-mode-toggle.component.jsx`
- Modify: `src/components/navigator/navigator.component.jsx`

**Interfaces:**
- Consumes: `useShopMode`, `SHOP_MODE`, `useLocale`, `useNavigate`.
- Produces: default-exported `<ShopModeToggle />` — a button that switches mode and navigates: when current mode is `3d` it shows "Back to classic" and navigates to `/{locale}`; otherwise shows "3D mode" and navigates to `/{locale}/shop3d` (also calling `setMode`).

- [ ] **Step 1: Write the toggle component**

Create `src/components/shop-mode-toggle/shop-mode-toggle.component.jsx`:
```jsx
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../context/locale.context";
import { useShopMode, SHOP_MODE } from "../../hooks/useShopMode.hook";

const ShopModeToggle = () => {
  const { mode, setMode } = useShopMode();
  const { t, locale } = useLocale();
  const navigate = useNavigate();

  const is3D = mode === SHOP_MODE.THREE_D;

  const handleClick = () => {
    if (is3D) {
      setMode(SHOP_MODE.CLASSIC);
      navigate(`/${locale}`);
    } else {
      setMode(SHOP_MODE.THREE_D);
      navigate(`/${locale}/shop3d`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="hidden text-xs font-bold uppercase tracking-widest text-cream/80 transition hover:text-mainOrange sm:inline-block"
    >
      {is3D ? t("exitToClassic") : t("exitTo3D")}
    </button>
  );
};

export default ShopModeToggle;
```

- [ ] **Step 2: Import and render it in the navigator**

In `src/components/navigator/navigator.component.jsx`, add the import after the existing component imports (after line 8, the `useLocale` import):
```jsx
import ShopModeToggle from "../shop-mode-toggle/shop-mode-toggle.component";
```
Then, in the right-hand controls `div` (the one with `className="flex items-center gap-3 md:gap-5"`), add the toggle as the first child, immediately before the existing locale `<button>`:
```jsx
            <ShopModeToggle />
```

- [ ] **Step 3: Manual verification**

Run: `rtk npm run dev`, open `http://localhost:5173/vi`.
Expected: A "3D mode" button appears in the header (desktop width). Clicking it navigates to `/vi/shop3d` (blank/soon-to-be page for now, or 404-redirect until Task 11). Stop the server.

- [ ] **Step 4: Commit**

```bash
rtk git add src/components/shop-mode-toggle src/components/navigator/navigator.component.jsx && rtk git commit -m "feat: add navbar Classic/3D mode toggle"
```

---

## Task 10: GLB model wrapper component

**Files:**
- Create: `src/components/shop3d/glb-model.component.jsx`

**Interfaces:**
- Consumes: `getGlbUrl` (Task 3), `@react-three/drei` `useGLTF`.
- Produces: `<GlbModel fileName position rotationY scale onReady? {...groupProps} />` — loads and renders a cloned GLB scene as a `<primitive>` inside a positioned `<group>`. Calls `onReady(scene)` once after load so callers can retexture slots. Also exports `preloadGlb(fileName)`.

- [ ] **Step 1: Implement the wrapper**

Create `src/components/shop3d/glb-model.component.jsx`:
```jsx
import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { getGlbUrl } from "../../utils/shop3d.assets";

const GlbModel = ({ fileName, position = [0, 0, 0], rotationY = 0, scale = 1, onReady, children, ...groupProps }) => {
  const { scene } = useGLTF(getGlbUrl(fileName));
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (onReady) onReady(cloned);
  }, [cloned, onReady]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale} {...groupProps}>
      <primitive object={cloned} />
      {children}
    </group>
  );
};

export const preloadGlb = (fileName) => useGLTF.preload(getGlbUrl(fileName));

export default GlbModel;
```

- [ ] **Step 2: Verify build**

Run: `rtk npm run build`
Expected: build succeeds (component compiles; not yet imported into any route so tree-shaken out).

- [ ] **Step 3: Commit**

```bash
rtk git add src/components/shop3d/glb-model.component.jsx && rtk git commit -m "feat: add GLB model wrapper for 3D scene"
```

---

## Task 11: Shop3D page shell + lazy route (WebGL guard, HUD, data fetch)

**Files:**
- Create: `src/components/shop3d/shop3d-hud.component.jsx`
- Create: `src/pages/shop3d.page.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `isWebGLAvailable` (Task 2), `useLocale`, `useShopMode`, `CartContext`, `LoadingSpinner`, `SceneCanvas` (Task 12 — imported lazily; create a temporary placeholder in this task, replaced in Task 12).
- Produces: default-exported `Shop3DPage`; lazy route `shop3d` under `LocalizedRoutes`.

- [ ] **Step 1: Create the HUD overlay**

Create `src/components/shop3d/shop3d-hud.component.jsx`:
```jsx
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/cart.context";
import { useLocale } from "../../context/locale.context";
import { useShopMode, SHOP_MODE } from "../../hooks/useShopMode.hook";

const Shop3DHud = () => {
  const { cartItems, toggleIsCartOpen } = useContext(CartContext);
  const { t, locale } = useLocale();
  const { setMode } = useShopMode();
  const navigate = useNavigate();

  const exitToClassic = () => {
    setMode(SHOP_MODE.CLASSIC);
    navigate(`/${locale}`);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4">
      <div className="flex items-start justify-between">
        <button onClick={exitToClassic} className="brand-button-outline pointer-events-auto text-xs">
          {t("exitToClassic")}
        </button>
        <button
          onClick={toggleIsCartOpen}
          className="brand-button pointer-events-auto relative text-xs"
          aria-label={t("cart")}
        >
          {t("cart")}
          {cartItems.length > 0 && (
            <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-mainOrange">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>
      <p className="mx-auto rounded bg-black/40 px-3 py-1 text-center text-[11px] font-bold uppercase tracking-widest text-cream">
        {t("shop3dHelp")}
      </p>
    </div>
  );
};

export default Shop3DHud;
```

- [ ] **Step 2: Create a temporary SceneCanvas placeholder**

Create `src/components/shop3d/scene-canvas.component.jsx` (replaced fully in Task 12):
```jsx
const SceneCanvas = () => null;
export default SceneCanvas;
```

- [ ] **Step 3: Create the page**

Create `src/pages/shop3d.page.jsx`:
```jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/loading-spinner/loading-spinner.component";
import Shop3DHud from "../components/shop3d/shop3d-hud.component";
import SceneCanvas from "../components/shop3d/scene-canvas.component";
import { useLocale } from "../context/locale.context";
import { apiUrl } from "../utils/api.utils";
import { isWebGLAvailable } from "../utils/webgl.utils";
import { resolveBottleInstances } from "../utils/shop3d.utils";
import { BOTTLE_PLACEMENTS } from "../utils/shop3d.config";

const Shop3DPage = () => {
  const { t, locale } = useLocale();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const webglOk = useMemo(() => isWebGLAvailable(), []);

  useEffect(() => {
    if (!webglOk) {
      setIsLoading(false);
      return;
    }
    const fetchProducts = async () => {
      try {
        const response = await axios.get(apiUrl("/api/products/getAllProducts"));
        setProducts(response.data);
      } catch (_error) {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [webglOk]);

  const bottles = useMemo(() => resolveBottleInstances(products, BOTTLE_PLACEMENTS), [products]);

  if (!webglOk) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center text-cream">
        <h1 className="font-heading text-2xl font-bold uppercase">{t("webglUnsupported")}</h1>
        <p className="max-w-md text-cream/70">{t("webglUnsupportedBody")}</p>
        <Link to={`/${locale}`} className="brand-button">{t("exitToClassic")}</Link>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="relative h-[calc(100vh-120px)] w-full overflow-hidden bg-[#0d1712]">
      <Shop3DHud />
      <SceneCanvas bottles={bottles} />
    </div>
  );
};

export default Shop3DPage;
```

- [ ] **Step 4: Add the lazy route in App.jsx**

In `src/App.jsx`, change the top imports: add `lazy` and `Suspense` to the react import and a `LoadingSpinner` import. Replace line 9 (`import { useContext } from "react";`) with:
```jsx
import { useContext, lazy, Suspense } from "react";
import LoadingSpinner from "./components/loading-spinner/loading-spinner.component";

const Shop3DPage = lazy(() => import("./pages/shop3d.page"));
```
Then inside `LocalizedRoutes`' `<Routes>`, add this route immediately after the `cartCheckout` route (line 23):
```jsx
      <Route
        path="shop3d"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Shop3DPage />
          </Suspense>
        }
      />
```

- [ ] **Step 5: Manual verification**

Run: `rtk npm run dev`, open `http://localhost:5173/vi/shop3d`.
Expected: HUD overlay renders (Exit to classic + Cart + help hint) over a dark panel; no crash. On a WebGL-disabled browser, the fallback message + classic link render instead. Stop the server.

- [ ] **Step 6: Verify code-splitting in build**

Run: `rtk npm run build`
Expected: build succeeds and emits a separate chunk for `shop3d.page` (three.js lands in a lazily-loaded chunk, not the main entry).

- [ ] **Step 7: Commit**

```bash
rtk git add src/pages/shop3d.page.jsx src/components/shop3d/shop3d-hud.component.jsx src/components/shop3d/scene-canvas.component.jsx src/App.jsx && rtk git commit -m "feat: add lazy 3D shop route with WebGL guard and HUD"
```

---

## Task 12: SceneCanvas — canvas, lights, controls, scene-state machine

**Files:**
- Modify: `src/components/shop3d/scene-canvas.component.jsx` (replace placeholder)

**Interfaces:**
- Consumes: `@react-three/fiber` `<Canvas>`, `@react-three/drei` `OrbitControls`, `Environment`; `ExteriorScene` (Task 13), `InteriorScene` (Task 14).
- Produces: `<SceneCanvas bottles={...} />` — holds `view` state (`"exterior" | "interior"`), renders exterior until the door is entered, then the interior. Passes `onEnter` to exterior and `bottles` to interior.

- [ ] **Step 1: Implement SceneCanvas (replace file contents)**

Replace the entire contents of `src/components/shop3d/scene-canvas.component.jsx` with:
```jsx
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import ExteriorScene from "./exterior-scene.component";
import InteriorScene from "./interior-scene.component";

const SceneCanvas = ({ bottles }) => {
  const [view, setView] = useState("exterior");

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 1.6, 6], fov: 55 }}
      shadows
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <Suspense fallback={null}>
        <Environment preset="apartment" />
        {view === "exterior" ? (
          <ExteriorScene onEnter={() => setView("interior")} />
        ) : (
          <InteriorScene bottles={bottles} />
        )}
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={9}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        enableDamping
      />
    </Canvas>
  );
};

export default SceneCanvas;
```

- [ ] **Step 2: Create minimal ExteriorScene and InteriorScene stubs so it compiles**

Create `src/components/shop3d/exterior-scene.component.jsx`:
```jsx
const ExteriorScene = ({ onEnter }) => (
  <mesh position={[0, 0.5, 0]} onClick={onEnter}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#d97706" />
  </mesh>
);

export default ExteriorScene;
```

Create `src/components/shop3d/interior-scene.component.jsx`:
```jsx
const InteriorScene = () => (
  <mesh position={[0, 0.5, 0]}>
    <boxGeometry args={[2, 1, 2]} />
    <meshStandardMaterial color="#166534" />
  </mesh>
);

export default InteriorScene;
```

- [ ] **Step 3: Manual verification**

Run: `rtk npm run dev`, open `http://localhost:5173/vi/shop3d`.
Expected: An orange cube renders in 3D; drag orbits the camera, scroll zooms (clamped). Clicking the cube swaps to a green box (exterior→interior state works). Stop the server.

- [ ] **Step 4: Commit**

```bash
rtk git add src/components/shop3d/scene-canvas.component.jsx src/components/shop3d/exterior-scene.component.jsx src/components/shop3d/interior-scene.component.jsx && rtk git commit -m "feat: add 3D scene canvas with exterior/interior state machine"
```

---

## Task 13: Exterior storefront with click-to-open door + logo slots

**Files:**
- Modify: `src/components/shop3d/exterior-scene.component.jsx` (replace stub)

**Interfaces:**
- Consumes: `GlbModel` (Task 10), `LOGO_SLOTS`, `SLOT_MATERIAL_NAME` (Task 4), `getGlbUrl`, three `TextureLoader`, drei `useCursor`, `Html`; `Logo` asset.
- Produces: `<ExteriorScene onEnter />` — places the 7 exterior GLBs, applies the shop logo texture to `signboard.glb`/`street-lamp.glb` slots, animates the entrance door open on click, then calls `onEnter`.

- [ ] **Step 1: Implement the exterior scene (replace file contents)**

Replace the entire contents of `src/components/shop3d/exterior-scene.component.jsx` with:
```jsx
import { useEffect, useRef, useState } from "react";
import { TextureLoader } from "three";
import { Html, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import GlbModel from "./glb-model.component";
import Logo from "../../assets/logo.png";
import { useLocale } from "../../context/locale.context";
import { LOGO_SLOTS, SLOT_MATERIAL_NAME } from "../../utils/shop3d.config";

const applyTextureToSlot = (root, materialName, texture) => {
  root.traverse((child) => {
    if (child.isMesh && child.material && child.material.name === materialName) {
      child.material.map = texture;
      child.material.needsUpdate = true;
    }
  });
};

const useLogoTexture = () => {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    const loaded = new TextureLoader().load(Logo);
    loaded.flipY = false;
    setTexture(loaded);
    return () => loaded.dispose();
  }, []);
  return texture;
};

const ExteriorScene = ({ onEnter }) => {
  const { t } = useLocale();
  const logoTexture = useLogoTexture();
  const [hovered, setHovered] = useState(false);
  const [opening, setOpening] = useState(false);
  const doorRef = useRef();
  useCursor(hovered);

  const attachLogo = (fileName) => (root) => {
    const slot = LOGO_SLOTS.find((entry) => entry.glb === fileName);
    if (slot && logoTexture) applyTextureToSlot(root, SLOT_MATERIAL_NAME, logoTexture);
  };

  useFrame((_state, delta) => {
    if (!opening || !doorRef.current) return;
    const target = -Math.PI / 2;
    doorRef.current.rotation.y = Math.max(target, doorRef.current.rotation.y - delta * 2.2);
    if (doorRef.current.rotation.y <= target + 0.02) onEnter();
  });

  return (
    <group>
      <GlbModel fileName="sidewalk-base.glb" position={[0, 0, 0]} />
      <GlbModel fileName="facade.glb" position={[0, 0, 0]} />
      <GlbModel fileName="display-window.glb" position={[-1.6, 0, 0.1]} />
      <GlbModel fileName="planter.glb" position={[1.8, 0, 0.6]} />
      <GlbModel fileName="signboard.glb" position={[0, 2.6, 0.1]} onReady={attachLogo("signboard.glb")} />
      <GlbModel fileName="street-lamp.glb" position={[-2.6, 0, 0.8]} onReady={attachLogo("street-lamp.glb")} />
      <group
        ref={doorRef}
        position={[0.5, 0, 0.2]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setOpening(true)}
      >
        <GlbModel fileName="entrance-door.glb" position={[0, 0, 0]} />
        {hovered && !opening && (
          <Html position={[0, 2.1, 0]} center distanceFactor={8}>
            <div className="whitespace-nowrap rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-cream">
              {t("openDoor")}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

export default ExteriorScene;
```

- [ ] **Step 2: Manual verification**

Run: `rtk npm run dev`, open `http://localhost:5173/vi/shop3d`.
Expected: The storefront renders from the real GLB models; the signboard and street-lamp banner show the shop logo. Hovering the door changes the cursor and shows an "Open door" hint; clicking swings the door open and transitions into the interior (green stub box from Task 12 until Task 14). Stop the server.

- [ ] **Step 3: Commit**

```bash
rtk git add src/components/shop3d/exterior-scene.component.jsx && rtk git commit -m "feat: build exterior storefront with click-to-open door and logo slots"
```

---

## Task 14: Interior scene — room, ambience, shelves, fixtures host

**Files:**
- Modify: `src/components/shop3d/interior-scene.component.jsx` (replace stub)
- Create: `src/components/shop3d/fixtures.component.jsx`

**Interfaces:**
- Consumes: `GlbModel`; `ProductBottle` (Task 15); `useLocale`, `useNavigate`, `useShopMode` (not needed), `CartContext.toggleIsCartOpen`, drei `useCursor`.
- Produces: `<InteriorScene bottles />` — renders structure + ambience GLBs, maps `bottles` to `<ProductBottle>`, and renders `<Fixtures onCheckout onOpenCart />`. `<Fixtures>` renders cashier/POS/basket with click handlers.

- [ ] **Step 1: Create the fixtures component**

Create `src/components/shop3d/fixtures.component.jsx`:
```jsx
import { useState } from "react";
import { useCursor } from "@react-three/drei";
import GlbModel from "./glb-model.component";

const ClickableFixture = ({ fileName, position, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      <GlbModel fileName={fileName} position={[0, 0, 0]} />
    </group>
  );
};

const Fixtures = ({ onCheckout, onOpenCart }) => (
  <group>
    <ClickableFixture fileName="cashier-counter.glb" position={[2.4, 0, 1.2]} onSelect={onCheckout} />
    <ClickableFixture fileName="pos-terminal.glb" position={[2.4, 0.9, 1.2]} onSelect={onCheckout} />
    <ClickableFixture fileName="shopping-basket.glb" position={[1.6, 0, 1.6]} onSelect={onOpenCart} />
    <GlbModel fileName="shipping-station.glb" position={[3.2, 0, -1.4]} />
    <GlbModel fileName="contact-board.glb" position={[3.4, 1.4, -2.2]} />
    <GlbModel fileName="desk-phone.glb" position={[2.4, 0.95, 0.9]} />
  </group>
);

export default Fixtures;
```

- [ ] **Step 2: Implement the interior scene (replace file contents)**

Replace the entire contents of `src/components/shop3d/interior-scene.component.jsx` with:
```jsx
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import GlbModel from "./glb-model.component";
import ProductBottle from "./product-bottle.component";
import Fixtures from "./fixtures.component";
import { CartContext } from "../../context/cart.context";
import { useLocale } from "../../context/locale.context";

const InteriorScene = ({ bottles }) => {
  const { toggleIsCartOpen } = useContext(CartContext);
  const { locale } = useLocale();
  const navigate = useNavigate();

  return (
    <group>
      {/* Structure */}
      <GlbModel fileName="room-shell.glb" position={[0, 0, 0]} />
      <GlbModel fileName="liquor-shelf-bay.glb" position={[0, 0, -1.6]} />
      <GlbModel fileName="specials-podium.glb" position={[-2.2, 0, 0.4]} />
      <GlbModel fileName="accessory-stand.glb" position={[2.0, 0, -0.6]} />
      <GlbModel fileName="ceiling-spotlight.glb" position={[0, 2.8, 0]} />

      {/* Ambience */}
      <GlbModel fileName="floor-rug.glb" position={[0, 0.01, 1.0]} />
      <GlbModel fileName="framed-art.glb" position={[-3.0, 1.6, 0]} />
      <GlbModel fileName="neon-sign.glb" position={[0, 2.2, -2.3]} />
      <GlbModel fileName="oak-barrel.glb" position={[-2.8, 0, 1.8]} />
      <GlbModel fileName="potted-plant.glb" position={[2.8, 0, 1.8]} />
      <GlbModel fileName="wooden-crate.glb" position={[-1.8, 0, 2.0]} />
      <GlbModel fileName="inspect-pedestal.glb" position={[0.5, 0, 1.2]} />

      {/* Products */}
      {bottles.map((instance) => (
        <ProductBottle key={instance.product._id} instance={instance} />
      ))}

      {/* Interactive fixtures */}
      <Fixtures
        onCheckout={() => navigate(`/${locale}/cartCheckout`)}
        onOpenCart={toggleIsCartOpen}
      />
    </group>
  );
};

export default InteriorScene;
```

- [ ] **Step 3: Provide a temporary ProductBottle stub so it compiles**

Create `src/components/shop3d/product-bottle.component.jsx` (fully implemented in Task 15):
```jsx
import GlbModel from "./glb-model.component";

const ProductBottle = ({ instance }) => (
  <GlbModel fileName={instance.glb} position={instance.position} rotationY={instance.rotationY} />
);

export default ProductBottle;
```

- [ ] **Step 4: Manual verification**

Run: `rtk npm run dev`, open `http://localhost:5173/vi/shop3d`, click the door to enter.
Expected: The interior renders with room, shelves, ambience props, bottles on the shelf, and fixtures. Clicking the cashier/POS navigates to `/vi/cartCheckout`; clicking the basket opens the cart dropdown. Stop the server.

- [ ] **Step 5: Commit**

```bash
rtk git add src/components/shop3d/interior-scene.component.jsx src/components/shop3d/fixtures.component.jsx src/components/shop3d/product-bottle.component.jsx && rtk git commit -m "feat: build interior scene with fixtures wired to checkout and cart"
```

---

## Task 15: Clickable product bottle with label texture + price panel + add-to-cart

**Files:**
- Modify: `src/components/shop3d/product-bottle.component.jsx` (replace stub)

**Interfaces:**
- Consumes: `GlbModel`, `SLOT_MATERIAL_NAME`, `getLabelTextureUrl` (Task 4), three `TextureLoader`, drei `Html`/`useCursor`, `CartContext.addItemToCart`, `useLocale`.
- Consumes instance shape: `{ product: { _id, name, priceInInteger, stock, image }, glb, position, rotationY }`.
- Produces: `<ProductBottle instance />` — textured bottle; hover highlight + cursor; click opens an `<Html>` panel with name/price/stock and an add-to-cart button.

- [ ] **Step 1: Implement the product bottle (replace file contents)**

Replace the entire contents of `src/components/shop3d/product-bottle.component.jsx` with:
```jsx
import { useContext, useEffect, useState } from "react";
import { TextureLoader } from "three";
import { Html, useCursor } from "@react-three/drei";
import GlbModel from "./glb-model.component";
import { CartContext } from "../../context/cart.context";
import { useLocale } from "../../context/locale.context";
import { SLOT_MATERIAL_NAME } from "../../utils/shop3d.config";
import { getLabelTextureUrl } from "../../utils/shop3d.utils";

const applyLabel = (root, texture) => {
  root.traverse((child) => {
    if (child.isMesh && child.material && child.material.name === SLOT_MATERIAL_NAME) {
      child.material.map = texture;
      child.material.needsUpdate = true;
    }
  });
};

const formatPrice = (value) => new Intl.NumberFormat("vi-VN").format(value || 0);

const ProductBottle = ({ instance }) => {
  const { product, glb, position, rotationY } = instance;
  const { addItemToCart } = useContext(CartContext);
  const { t } = useLocale();
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const [texture, setTexture] = useState(null);
  useCursor(hovered);

  useEffect(() => {
    const loaded = new TextureLoader().load(getLabelTextureUrl(product));
    loaded.flipY = false;
    setTexture(loaded);
    return () => loaded.dispose();
  }, [product]);

  const attachLabel = (root) => {
    if (texture) applyLabel(root, texture);
  };

  const outOfStock = (product.stock || 0) <= 0;

  return (
    <group
      position={position}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(event) => {
        event.stopPropagation();
        setOpen((current) => !current);
      }}
    >
      <GlbModel
        fileName={glb}
        position={[0, 0, 0]}
        rotationY={rotationY}
        scale={hovered ? 1.05 : 1}
        onReady={attachLabel}
      />
      {open && (
        <Html position={[0, 0.9, 0]} center distanceFactor={7}>
          <div className="w-44 rounded border border-warmGold/50 bg-cream p-3 text-center text-ink shadow-xl">
            <p className="font-heading text-sm font-bold leading-tight">{product.name}</p>
            <p className="mt-1 text-sm text-mainOrange">{formatPrice(product.priceInInteger)}₫</p>
            <p className="text-[11px] text-ink/60">{t("stock")}: {product.stock}</p>
            <button
              className="brand-button mt-2 w-full text-xs disabled:opacity-40"
              disabled={outOfStock}
              onClick={(event) => {
                event.stopPropagation();
                addItemToCart(product, 1);
              }}
            >
              {outOfStock ? t("soldOut") : t("addToCart")}
            </button>
          </div>
        </Html>
      )}
    </group>
  );
};

export default ProductBottle;
```

- [ ] **Step 2: Manual verification**

Run: `rtk npm run dev`, open `http://localhost:5173/vi/shop3d`, enter the shop.
Expected: Each bottle displays its product image on the label. Hovering a bottle enlarges it slightly and shows a pointer cursor. Clicking opens a panel with the product name, price (formatted with ₫), and stock; clicking "Thêm vào giỏ" increments the HUD cart count. Out-of-stock products show a disabled "Hết hàng" button. Stop the server.

- [ ] **Step 3: Commit**

```bash
rtk git add src/components/shop3d/product-bottle.component.jsx && rtk git commit -m "feat: add clickable labeled product bottles with add-to-cart"
```

---

## Task 16: Preload GLBs + final integration pass

**Files:**
- Modify: `src/pages/shop3d.page.jsx` (add preloading)

**Interfaces:**
- Consumes: `preloadGlb` (Task 10), all GLB filenames.

- [ ] **Step 1: Preload the scene GLBs on route entry**

In `src/pages/shop3d.page.jsx`, add this import after the existing imports:
```jsx
import { preloadGlb } from "../components/shop3d/glb-model.component";
```
Then add this module-level block immediately after the imports (before `const Shop3DPage`):
```jsx
const SCENE_GLBS = [
  "sidewalk-base.glb", "facade.glb", "display-window.glb", "planter.glb",
  "signboard.glb", "street-lamp.glb", "entrance-door.glb",
  "room-shell.glb", "liquor-shelf-bay.glb", "specials-podium.glb",
  "accessory-stand.glb", "ceiling-spotlight.glb",
  "floor-rug.glb", "framed-art.glb", "neon-sign.glb", "oak-barrel.glb",
  "potted-plant.glb", "wooden-crate.glb", "inspect-pedestal.glb",
  "cashier-counter.glb", "pos-terminal.glb", "shopping-basket.glb",
  "shipping-station.glb", "contact-board.glb", "desk-phone.glb",
  "bottle-herbal.glb", "bottle-herbal-mini.glb",
];
SCENE_GLBS.forEach(preloadGlb);
```

- [ ] **Step 2: Run the full test suite**

Run: `rtk npm run test`
Expected: PASS — all existing tests plus the new util/hook/component tests (webgl, shop3d.utils, useShopMode, shop-mode-selector).

- [ ] **Step 3: Lint and build**

Run: `rtk npm run lint && rtk npm run build`
Expected: lint passes with zero warnings; build succeeds and emits a separate lazy chunk containing three.js.

- [ ] **Step 4: Full manual smoke test**

Run: `rtk npm run dev`. With cleared localStorage, open `http://localhost:5173/vi`:
1. Splash appears → choose 3D → routed to `/vi/shop3d`.
2. Exterior renders with logos; click door → opens → interior.
3. Bottles show labels; click a bottle → add to cart → HUD count updates.
4. Click cashier → checkout page; back, click basket → cart opens.
5. Header "Về bản cổ điển" returns to classic; header "3D mode" returns to 3D.
6. Reload `/vi` → no splash (choice persisted).
Stop the server.

- [ ] **Step 5: Commit**

```bash
rtk git add src/pages/shop3d.page.jsx && rtk git commit -m "feat: preload 3D shop GLBs on route entry"
```

---

## Self-Review Notes

- **Spec coverage:** Version selector (Tasks 5,7,8,9) ✓; lazy Three.js route (Tasks 1,11) ✓; exterior with click-to-open door (Task 13) ✓; interior structure + ambience (Task 14) ✓; product mapping + label textures on verified `slot_face`/`label_slot` (Tasks 4,15) ✓; logo slots on signboard/street-lamp (Task 13) ✓; bottle click → price/stock + add to cart via CartContext (Task 15) ✓; cashier/POS → checkout, basket → cart (Task 14) ✓; hover highlight + cursor (Tasks 13,14,15) ✓; OrbitControls constrained + mobile dpr cap (Task 12) ✓; HUD overlay (Task 11) ✓; WebGL fallback (Task 11) ✓; i18n vi/en (Task 6) ✓.
- **Type consistency:** instance shape `{ product, glb, position, rotationY }` produced by `resolveBottleInstances` (Task 4) and consumed identically in Tasks 14/15. `SHOP_MODE`/`SHOP_MODE_STORAGE_KEY` names consistent across Tasks 5,7,9,11. `getGlbUrl`/`preloadGlb`/`GlbModel` signatures consistent across Tasks 3,10,13,14,15,16.
- **Deferred (per spec "out of scope for v1"):** neck labels, remaining 7 product GLBs, category browsing. Positions in `shop3d.config.js` and scene components are first-pass estimates the user expects to fine-tune after seeing v1.

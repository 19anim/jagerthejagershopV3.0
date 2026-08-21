import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/loading-spinner/loading-spinner.component";
import Shop3DHud from "../components/shop3d/shop3d-hud.component";
import SceneCanvas from "../components/shop3d/scene-canvas.component";
import Shop3DCartOverlay from "../components/shop3d/shop3d-cart-overlay.component";
import Shop3DToast from "../components/shop3d/shop3d-toast.component";
import { CartContext } from "../context/cart.context";
import { useLocale } from "../context/locale.context";
import { apiUrl } from "../utils/api.utils";
import { isWebGLAvailable } from "../utils/webgl.utils";
import { resolveProductInstances, resolveAccessoryPlacements } from "../utils/shop3d.utils";
import { FIXTURES, PRODUCT_SLOTS, ACCESSORY_PLACEMENTS } from "../utils/shop3d.config";
import { preloadGlb } from "../components/shop3d/glb-model.component";

const SCENE_GLBS = [
  "sidewalk-base.glb", "display-window.glb", "planter.glb",
  "signboard.glb", "street-lamp.glb", "entrance-door.glb",
  "wall-set.glb", "roof.glb", "floor-interior.glb", "doorway-frame.glb",
  "liquor-shelf-bay.glb", "specials-podium.glb",
  "accessory-stand.glb", "accessory-shelf.glb", "wine-cabinet.glb",
  "ceiling-spotlight.glb",
  "floor-rug.glb", "framed-art.glb", "neon-sign.glb", "oak-barrel.glb",
  "potted-plant.glb", "wooden-crate.glb", "inspect-pedestal.glb",
  "cashier-counter.glb", "pos-terminal.glb", "shopping-basket.glb",
  "shipping-station.glb", "contact-board.glb", "desk-phone.glb",
  "bottle-herbal.glb", "bottle-herbal-mini.glb",
  "drinking-glass.glb", "jigger.glb", "pourer.glb", "shaker.glb", "flask.glb", "gift-box.glb",
];
if (isWebGLAvailable()) SCENE_GLBS.forEach(preloadGlb);

const Shop3DPage = () => {
  const { t, locale } = useLocale();
  const { cartItems } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Shared navigation phase so the HUD (Exit button, help text, touch joystick)
  // and the canvas stay in sync: outside → entering → inside → exiting → outside.
  const [phase, setPhase] = useState("outside");
  const moveRef = useRef({ x: 0, y: 0 });
  const webglOk = useMemo(() => isWebGLAvailable(), []);

  // Fire the "added to basket" toast whenever total cart quantity grows. Tracking
  // the summed quantity (not array length) catches re-adds of an existing bottle,
  // which only bump quantity. Seeded from the persisted cart so page load is silent.
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );
  const prevCartCount = useRef(cartCount);
  const [addedTick, setAddedTick] = useState(0);
  useEffect(() => {
    if (cartCount > prevCartCount.current) setAddedTick((tick) => tick + 1);
    prevCartCount.current = cartCount;
  }, [cartCount]);

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

  const bottles = useMemo(() => resolveProductInstances(products, FIXTURES, PRODUCT_SLOTS), [products]);
  const accessories = useMemo(() => resolveAccessoryPlacements(FIXTURES, ACCESSORY_PLACEMENTS), []);

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
    <div className="relative h-screen w-full overflow-hidden bg-[#0d1712]">
      <Shop3DHud
        phase={phase}
        onExit={() => setPhase("exiting")}
        moveRef={moveRef}
      />
      <SceneCanvas
        bottles={bottles}
        accessories={accessories}
        phase={phase}
        setPhase={setPhase}
        moveRef={moveRef}
      />
      <Shop3DToast trigger={addedTick} />
      <Shop3DCartOverlay />
    </div>
  );
};

export default Shop3DPage;

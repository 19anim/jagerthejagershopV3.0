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
import { preloadGlb } from "../components/shop3d/glb-model.component";

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

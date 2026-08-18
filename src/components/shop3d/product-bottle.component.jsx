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

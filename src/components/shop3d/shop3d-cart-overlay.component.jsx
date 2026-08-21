import { Suspense, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import GlbModel from "./glb-model.component";
import CartItem from "../cart-dropdown/cart-item.component";
import { CartContext } from "../../context/cart.context";
import { useLocale } from "../../context/locale.context";

// Slowly spins the shopping-basket.glb so the overlay reads as a live 3D object
// rather than a flat icon. The basket model is only ~0.41 m wide, so it is scaled
// up and lifted to fill the mini-canvas. Same useFrame pattern the scene canvas uses.
const SpinningBasket = () => {
  const group = useRef();
  useFrame((_state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.6;
  });
  return (
    <group ref={group} scale={3.4}>
      <GlbModel fileName="shopping-basket.glb" position={[0, -0.12, 0]} />
    </group>
  );
};

// Immersive cart view for the walk-through shop. The classic slide-in CartDropdown
// lives inside Navigator, which the 3D page never mounts — so this is the cart the
// 3D HUD/basket open. Blurs the scene behind a centred panel that shows the live
// basket next to the items already added.
const Shop3DCartOverlay = () => {
  const { cartItems, isCartOpen, toggleIsCartOpen, subtotal } = useContext(CartContext);
  const { t, locale } = useLocale();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const goToCheckout = () => {
    toggleIsCartOpen();
    navigate(`/${locale}/cartCheckout`);
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred backdrop — clicking it closes the overlay. */}
      <button
        aria-label={t("close")}
        onClick={toggleIsCartOpen}
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
      />

      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-warmGold/30 bg-mainGreen text-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-heading text-xl font-bold uppercase tracking-wider">{t("yourBasket")}</h2>
          <button onClick={toggleIsCartOpen} aria-label={t("close")}>
            <ion-icon name="close-outline" class="text-3xl"></ion-icon>
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-[280px_1fr]">
          {/* Live 3D basket */}
          <div className="hidden items-center justify-center border-r border-white/10 bg-black/20 md:flex">
            <div className="h-72 w-full">
              <Canvas dpr={[1, 2]} camera={{ position: [0, 0.5, 1.9], fov: 42 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[3, 5, 4]} intensity={1.1} />
                <Suspense fallback={null}>
                  <SpinningBasket />
                </Suspense>
              </Canvas>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-5">
            {cartItems.length === 0 ? (
              <p className="text-cream/70">{t("emptyCart")}</p>
            ) : (
              cartItems.map((item) => <CartItem key={item._id} cartItem={item} />)
            )}
          </div>
        </div>

        <div className="border-t border-white/10 p-5">
          <div className="mb-4 flex justify-between font-bold">
            <span>{t("total")}</span>
            <span>{subtotal.toLocaleString()} VNĐ</span>
          </div>
          <button
            onClick={goToCheckout}
            disabled={cartItems.length === 0}
            className="brand-button w-full disabled:opacity-40"
          >
            {t("checkout")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shop3DCartOverlay;

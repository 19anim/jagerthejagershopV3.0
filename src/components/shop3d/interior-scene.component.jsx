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

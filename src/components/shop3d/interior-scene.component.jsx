import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import GlbModel from "./glb-model.component";
import ProductBottle from "./product-bottle.component";
import Fixtures from "./fixtures.component";
import { CartContext } from "../../context/cart.context";
import { useLocale } from "../../context/locale.context";
import { FIXTURES } from "../../utils/shop3d.config";

const InteriorScene = ({ bottles, accessories = [] }) => {
  const { toggleIsCartOpen } = useContext(CartContext);
  const { locale } = useLocale();
  const navigate = useNavigate();

  return (
    <group>
      {/* Structure: floor + ceiling lights. The enclosing walls/roof come from
          wall-set / roof in the exterior scene (room-shell would duplicate the
          9.5×11 enclosure and z-fight, so it is intentionally omitted).
          floor-interior drops onto the origin; its top (walking surface) is y=0.06.
          Ceiling underside is y=3.66, so the spotlight hangs just below it. */}
      <GlbModel fileName="floor-interior.glb" position={[0, 0, 0]} />
      <GlbModel fileName="ceiling-spotlight.glb" position={[0, 3.66, 0]} />

      {/* Shelves, wine cabinet and accessory stands, driven by placement config
          so products can be slotted onto their measured surfaces. */}
      {FIXTURES.map((fixture) => (
        <GlbModel
          key={fixture.id}
          fileName={fixture.glb}
          position={fixture.position}
          rotationY={fixture.rotationY || 0}
          blocking={fixture.blocking}
        />
      ))}

      {/* Ambience (props standing on the floor sit on the walking surface y=0.06;
          wall art keeps its own mounting height). Positioned clear of the contract
          fixtures against the enlarged inner faces (left x −4.75, back z −5.50). */}
      <GlbModel fileName="floor-rug.glb" position={[0, 0.07, 0.5]} />
      {/* Framed art hangs on the LEFT wall (inner face x=−4.75). The model faces
          +z by default, so it must be turned +90° to face the room (+x); its 0.96 m
          width then runs along z and the backing sits on the wall face. */}
      <GlbModel fileName="framed-art.glb" position={[-4.74, 1.6, 0]} rotationY={1.5708} />
      <GlbModel fileName="neon-sign.glb" position={[0, 2.4, -5.45]} />
      {/* Floor props against the LEFT wall: offset by half their footprint so they
          stand flush instead of clipping through the x=−4.75 face. */}
      <GlbModel fileName="oak-barrel.glb" position={[-4.4, 0.06, 4.2]} />
      <GlbModel fileName="potted-plant.glb" position={[4.35, 0.06, 4.2]} />
      <GlbModel fileName="wooden-crate.glb" position={[-4.46, 0.06, 0.6]} />

      {/* Products resting on shelf/cabinet/podium surfaces */}
      {bottles.map((instance) => (
        <ProductBottle key={instance.product._id} instance={instance} />
      ))}

      {/* Decorative accessory props on the accessory fixtures */}
      {accessories.map((item, index) => (
        <GlbModel
          key={`${item.glb}-${index}`}
          fileName={item.glb}
          position={item.position}
          rotationY={item.rotationY}
        />
      ))}

      {/* Interactive fixtures (cashier → checkout, basket → cart) */}
      <Fixtures
        onCheckout={() => navigate(`/${locale}/cartCheckout`)}
        onOpenCart={toggleIsCartOpen}
      />
    </group>
  );
};

export default InteriorScene;

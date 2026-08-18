import GlbModel from "./glb-model.component";

const ProductBottle = ({ instance }) => (
  <GlbModel fileName={instance.glb} position={instance.position} rotationY={instance.rotationY} />
);

export default ProductBottle;

const InteriorScene = () => (
  <mesh position={[0, 0.5, 0]}>
    <boxGeometry args={[2, 1, 2]} />
    <meshStandardMaterial color="#166534" />
  </mesh>
);

export default InteriorScene;

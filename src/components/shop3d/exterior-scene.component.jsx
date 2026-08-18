const ExteriorScene = ({ onEnter }) => (
  <mesh position={[0, 0.5, 0]} onClick={onEnter}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#d97706" />
  </mesh>
);

export default ExteriorScene;

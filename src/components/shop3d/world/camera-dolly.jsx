import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Matrix4, Quaternion, Vector3 } from "three";

const look = new Matrix4();
const facing = new Quaternion();
const goal = new Vector3();
const aim = new Vector3();

// Eases the camera through a list of poses ({ position, target }) and calls
// onArrived once at the last one. Used for walking in through the door and out.
const CameraDolly = ({ active, path, onArrived, speed = 2.4 }) => {
  const step = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    if (active) {
      step.current = 0;
      done.current = false;
    }
  }, [active]);

  useFrame(({ camera }, delta) => {
    if (!active || done.current) return;
    const pose = path[step.current];
    goal.fromArray(pose.position);
    aim.fromArray(pose.target);
    const t = Math.min(1, delta * speed);
    camera.position.lerp(goal, t);
    look.lookAt(camera.position, aim, camera.up);
    facing.setFromRotationMatrix(look);
    camera.quaternion.slerp(facing, t);
    if (camera.position.distanceTo(goal) < 0.12) {
      if (step.current < path.length - 1) step.current += 1;
      else {
        done.current = true;
        onArrived();
      }
    }
  });
  return null;
};

export default CameraDolly;

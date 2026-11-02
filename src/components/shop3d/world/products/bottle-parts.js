import { FrontSide, MeshPhysicalMaterial } from "three";

// What a product-GLB material is for, so it can be made instancing- and flicker-safe.
export const classifyMaterial = (material) => {
  const name = (material.name || "").toLowerCase();
  if (name === "slot_face") return "slot";
  if (name.includes("liquid")) return "liquid";
  if (name.includes("glass")) return (material.transmission || 0) > 0 || material.opacity >= 0.5 ? "darkGlass" : "clearGlass";
  return material.map ? "label" : "solid";
};

// Dark glass becomes opaque clearcoat glass (no transmission pass: costly and
// it flickers with thousands of instances). Clear glass stays see-through but
// single-sided without depth writes. Labels use alpha testing, not blending.
export const prepareBottleMaterial = (material, kind, labelTexture) => {
  switch (kind) {
    case "darkGlass":
      return new MeshPhysicalMaterial({ name: material.name, color: material.color.clone(), roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 });
    case "clearGlass":
      return new MeshPhysicalMaterial({ name: material.name, color: material.color.clone(), roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.22, depthWrite: false, side: FrontSide });
    case "liquid": {
      const m = material.clone();
      m.transparent = false;
      m.opacity = 1;
      m.side = FrontSide;
      return m;
    }
    case "label": {
      const m = material.clone();
      if (m.transparent) {
        m.transparent = false;
        m.alphaTest = 0.5;
      }
      m.side = FrontSide;
      return m;
    }
    case "slot": {
      const m = material.clone();
      if (labelTexture) m.map = labelTexture;
      return m;
    }
    default:
      return material.clone();
  }
};

export const hasLabelSlot = (scene) => {
  let found = false;
  scene.traverse((o) => {
    if (o.isMesh && o.material?.name === "slot_face") found = true;
  });
  return found;
};

// Flattens a loaded bottle GLB into instanceable parts: each mesh's geometry with
// its node transform baked in, plus a fixed-up material. Liquid behind opaque
// glass is dropped (never visible). Opaque parts come first, transparent last.
export const extractBottleParts = (scene, labelTexture) => {
  scene.updateMatrixWorld(true);
  const meshes = [];
  scene.traverse((o) => {
    if (o.isMesh) meshes.push(o);
  });
  const kinds = meshes.map((m) => classifyMaterial(m.material));
  const opaqueGlass = kinds.includes("darkGlass");
  const parts = [];
  meshes.forEach((m, i) => {
    if (kinds[i] === "liquid" && opaqueGlass) return;
    parts.push({ kind: kinds[i], geometry: m.geometry.clone().applyMatrix4(m.matrixWorld), material: prepareBottleMaterial(m.material, kinds[i], labelTexture) });
  });
  return parts.sort((a, b) => Number(a.material.transparent) - Number(b.material.transparent));
};

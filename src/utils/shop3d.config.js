// Curated shelf: two herbal-bottle GLBs mapped to real catalog products by name.
// Verified GLB slots: bottle-herbal.glb & bottle-herbal-mini.glb both expose a
// `slot_face` material on a `label_slot` node for the product label texture.
export const BOTTLE_PLACEMENTS = [
  { productName: "Jagermeister Original nội địa Đức 700ml", glb: "bottle-herbal.glb", position: [-1.8, 0.9, -1.2] },
  { productName: "Jagermeister Original 700ml", glb: "bottle-herbal.glb", position: [-0.9, 0.9, -1.2] },
  { productName: "Jagermeister Original 200ml", glb: "bottle-herbal.glb", position: [0.0, 0.9, -1.2] },
  { productName: "Jagermeister Original 1000ml", glb: "bottle-herbal.glb", position: [0.9, 0.9, -1.2] },
  { productName: "Jagermeister Orange 1000ml", glb: "bottle-herbal.glb", position: [1.8, 0.9, -1.2] },
  { productName: "Jagermeister Original 20ml", glb: "bottle-herbal-mini.glb", position: [-0.5, 0.9, -0.2] },
  { productName: "Jagermeister Original nội địa Đức 100ml", glb: "bottle-herbal-mini.glb", position: [0.5, 0.9, -0.2] },
];

// Shop logo applied to these exterior slots (verified nodes/materials).
export const LOGO_SLOTS = [
  { glb: "signboard.glb", node: "logo_slot" },
  { glb: "street-lamp.glb", node: "banner_slot" },
];

// The mesh material name that receives an image texture across GLB slots.
export const SLOT_MATERIAL_NAME = "slot_face";

import { describe, expect, it } from "vitest";
import { BoxGeometry, DoubleSide, FrontSide, Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Texture } from "three";
import { classifyMaterial, extractBottleParts, hasLabelSlot } from "./bottle-parts";

const mesh = (material, y = 0) => {
  const m = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), material);
  m.position.y = y;
  return m;
};
const named = (Ctor, name, props = {}) => Object.assign(new Ctor(props), { name });

describe("bottle parts", () => {
  it("classifies the product GLB materials", () => {
    expect(classifyMaterial(named(MeshPhysicalMaterial, "bottle_glass", { transmission: 0.18, opacity: 0.88, transparent: true }))).toBe("darkGlass");
    expect(classifyMaterial(named(MeshPhysicalMaterial, "bottle_glass_clear", { opacity: 0.13, transparent: true }))).toBe("clearGlass");
    expect(classifyMaterial(named(MeshStandardMaterial, "bottle_liquid_amber"))).toBe("liquid");
    expect(classifyMaterial(named(MeshStandardMaterial, "slot_face"))).toBe("slot");
    expect(classifyMaterial(new MeshStandardMaterial({ map: new Texture() }))).toBe("label");
    expect(classifyMaterial(named(MeshStandardMaterial, "cap_green"))).toBe("solid");
  });

  it("drops the liquid behind opaque glass and removes transmission", () => {
    const root = new Group();
    root.add(mesh(named(MeshPhysicalMaterial, "bottle_glass", { transmission: 0.18, opacity: 0.88, transparent: true })));
    root.add(mesh(named(MeshStandardMaterial, "bottle_liquid")));
    root.add(mesh(new MeshStandardMaterial({ map: new Texture(), transparent: true, side: DoubleSide }), 0.12));
    const parts = extractBottleParts(root);
    expect(parts.map((p) => p.kind).sort()).toEqual(["darkGlass", "label"]);
    const glass = parts.find((p) => p.kind === "darkGlass").material;
    expect(glass.transparent).toBe(false);
    expect(glass.transmission).toBe(0);
    const label = parts.find((p) => p.kind === "label");
    expect(label.material.transparent).toBe(false);
    expect(label.material.alphaTest).toBe(0.5);
    expect(label.material.side).toBe(FrontSide);
    label.geometry.computeBoundingBox();
    expect(label.geometry.boundingBox.min.y).toBeCloseTo(0.07); // node transform baked in
  });

  it("keeps the liquid inside clear glass and draws the glass last", () => {
    const root = new Group();
    root.add(mesh(named(MeshPhysicalMaterial, "bottle_glass_clear", { opacity: 0.13, transparent: true })));
    root.add(mesh(named(MeshStandardMaterial, "bottle_liquid_amber", { transparent: true, opacity: 0.62, side: DoubleSide })));
    const parts = extractBottleParts(root);
    expect(parts.map((p) => p.kind)).toEqual(["liquid", "clearGlass"]);
    expect(parts[0].material.transparent).toBe(false);
    expect(parts[1].material.depthWrite).toBe(false);
    expect(parts[1].material.side).toBe(FrontSide);
  });

  it("puts the product label on slot_face meshes", () => {
    const root = new Group();
    root.add(mesh(named(MeshStandardMaterial, "slot_face")));
    expect(hasLabelSlot(root)).toBe(true);
    const label = new Texture();
    expect(extractBottleParts(root, label)[0].material.map).toBe(label);
  });
});

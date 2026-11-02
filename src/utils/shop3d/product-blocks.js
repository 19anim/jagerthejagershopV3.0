// Turns catalog products into bottles on shelves. Each product gets blocks of
// side-by-side facings (like a real shop), repeated across the shelf runs until
// they are full; each facing is 1..maxDepth bottles deep by stock. Pure: no three.js.

// Measured from the GLBs (bounding boxes, metres): w across the label (x),
// h height, d front-to-back (z). Base sits at y = 0, label faces +z.
export const BOTTLE_DIMS = {
  "bottle-20ml.glb": { w: 0.03, h: 0.085, d: 0.022 },
  "bottle-100ml.glb": { w: 0.051, h: 0.138, d: 0.037 },
  "bottle-200ml.glb": { w: 0.064, h: 0.164, d: 0.046 },
  "bottle-350ml.glb": { w: 0.077, h: 0.204, d: 0.055 },
  "bottle-700ml.glb": { w: 0.097, h: 0.244, d: 0.068 },
  "bottle-1000ml.glb": { w: 0.109, h: 0.269, d: 0.077 },
  "orange-20ml.glb": { w: 0.03, h: 0.085, d: 0.022 },
  "orange-1000ml.glb": { w: 0.109, h: 0.269, d: 0.077 },
  "manifest-40ml.glb": { w: 0.036, h: 0.094, d: 0.02 },
  "manifest-1000ml.glb": { w: 0.1, h: 0.258, d: 0.055 },
  "coldbrew-20ml.glb": { w: 0.03, h: 0.085, d: 0.022 },
  "coldbrew-1000ml.glb": { w: 0.109, h: 0.269, d: 0.077 },
  "bottle-herbal-mini.glb": { w: 0.034, h: 0.089, d: 0.024 },
};

export const MINI_HEIGHT = 0.15;
export const sizeClass = (dims) => (dims.h < MINI_HEIGHT ? "mini" : "std");

const FACING_GAP = 0.015; // between neighbouring facings
const ROW_GAP = 0.01; // between rows going back
const BLOCK_GAP = 0.04; // between product blocks
const BLOCK_WIDTH = 0.6; // target width of one product block
const SIDE_PAD = 0.03; // keep clear of uprights at both run ends
const FRONT_INSET = 0.03; // set back from the shelf lip
const HEAD_ROOM = 0.01;

const norm = (model) => (model || "").trim().toLowerCase();
const stackDepth = (stock, maxDepth) => Math.max(1, Math.min(stock || 0, maxDepth));

const eligibleProducts = (products, dims) => {
  const unknown = [];
  const ok = products.filter((product) => {
    const model = norm(product.shop3dModel);
    if (model && dims[model]) return true;
    unknown.push(product.name || product._id);
    return false;
  });
  if (unknown.length) console.warn(`[shop3d] No bottle model for: ${unknown.join(", ")}`);
  return ok.sort((a, b) => norm(a.shop3dModel).localeCompare(norm(b.shop3dModel)) || String(a._id).localeCompare(String(b._id)));
};

export const buildShelfInstances = ({ products, runs, dims = BOTTLE_DIMS, maxDepth = 2, maxInstances = Infinity, eyeLevel = 1.3 }) => {
  const eligible = eligibleProducts(products, dims);
  if (!eligible.length) return [];
  const dimsOf = (product) => dims[norm(product.shop3dModel)];

  // Fill eye-level shelves first so a small budget trims the floor and top shelves.
  const shelves = [];
  runs.forEach((r, runIndex) =>
    r.levels.forEach((y, levelIndex) => {
      if (r.skipLevels?.includes(levelIndex)) return;
      const clearance = r.clearances[levelIndex];
      const fits = eligible.filter((product) => {
        const d = dimsOf(product);
        return r.accepts.includes(sizeClass(d)) && d.h + HEAD_ROOM <= clearance;
      });
      if (fits.length) shelves.push({ r, runIndex, levelIndex, y, fits, cursor: SIDE_PAD, full: false });
    })
  );
  shelves.sort((a, b) => Math.abs(a.y - eyeLevel) - Math.abs(b.y - eyeLevel) || a.runIndex - b.runIndex || a.levelIndex - b.levelIndex);

  const out = [];
  const blocks = new Map(); // blocks placed per product

  // Puts one block of `product` at the shelf's cursor; false (and the shelf is
  // marked full) when not even one facing fits.
  const place = (shelf, product) => {
    const { r } = shelf;
    const d = dimsOf(product);
    const pitch = d.w + FACING_GAP;
    const facings = Math.min(Math.max(1, Math.floor(BLOCK_WIDTH / pitch)), Math.floor((r.length - SIDE_PAD - shelf.cursor) / pitch));
    if (facings < 1) {
      shelf.full = true;
      return false;
    }
    const rowsFit = Math.max(1, Math.floor((r.depth - FRONT_INSET) / (d.d + ROW_GAP)));
    const depth = Math.min(stackDepth(product.stock, maxDepth), rowsFit);
    const rotationY = Math.atan2(r.facing[0], r.facing[1]);
    for (let f = 0; f < facings && out.length < maxInstances; f++) {
      const along = shelf.cursor + pitch * (f + 0.5);
      for (let row = 0; row < depth && out.length < maxInstances; row++) {
        const inset = FRONT_INSET + d.d / 2 + row * (d.d + ROW_GAP);
        out.push({
          key: `${r.id}:${shelf.levelIndex}:${out.length}`,
          product,
          model: norm(product.shop3dModel),
          runId: r.id,
          levelIndex: shelf.levelIndex,
          facing: f,
          depthIndex: row,
          position: [r.start[0] + r.dir[0] * along - r.facing[0] * inset, shelf.y, r.start[1] + r.dir[1] * along - r.facing[1] * inset],
          rotationY,
          height: d.h,
        });
      }
    }
    blocks.set(product, (blocks.get(product) || 0) + 1);
    shelf.cursor += facings * pitch + BLOCK_GAP;
    return true;
  };

  // Pass 1, coverage: every product gets one block on the best (most eye-level)
  // shelf that takes it, before the budget can run out.
  for (const product of eligible) {
    if (out.length >= maxInstances) break;
    for (const shelf of shelves) if (!shelf.full && shelf.fits.includes(product) && place(shelf, product)) break;
  }
  // Pass 2, fill: each shelf in eye-level order; the next block goes to the
  // fitting product with the fewest blocks so far.
  for (const shelf of shelves) {
    while (!shelf.full && out.length < maxInstances) {
      const product = shelf.fits.reduce((best, p) => ((blocks.get(p) || 0) < (blocks.get(best) || 0) ? p : best));
      if (!place(shelf, product)) break;
    }
  }
  return out;
};

export const groupInstances = (instances) => {
  const groups = new Map();
  for (const instance of instances) {
    const key = `${instance.product._id}|${instance.model}`;
    if (!groups.has(key)) groups.set(key, { key, product: instance.product, model: instance.model, instances: [] });
    groups.get(key).instances.push(instance);
  }
  return [...groups.values()];
};

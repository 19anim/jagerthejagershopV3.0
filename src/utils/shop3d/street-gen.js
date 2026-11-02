// Seeded description of a row of Saigon shophouses. Pure data; the street
// component turns it into geometry.

export const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// [text, background, foreground] for the LED shop signs (one atlas row each).
export const SIGN_TEXTS = [
  ["CÀ PHÊ SỮA ĐÁ", "#0e1a1f", "#44e0ee"],
  ["NHÀ THUỐC", "#f4f4f2", "#1b7d3b"],
  ["ĐIỆN THOẠI", "#121212", "#ffffff"],
  ["TIỆM BÁNH", "#2a0f1a", "#ff6fa3"],
  ["SPA • NAIL", "#ffffff", "#c23b7d"],
  ["QUÁN PHỞ", "#ffd23a", "#7a1e12"],
  ["TẠP HÓA", "#123a8c", "#ffffff"],
  ["TRÀ SỮA", "#f6efe2", "#8a4b1f"],
];

const FACADES = ["facadeWhite", "facadeCream", "facadeGrey", "facadeDark"];
const MIN_W = 3.6;
const MAX_W = 7.2;

export const generateRow = ({ from, to, seed }) => {
  const rnd = mulberry32(seed);
  const pick = (n) => Math.floor(rnd() * n);
  const houses = [];
  let x = from;
  while (to - x > 1e-6) {
    const left = to - x;
    let w = 4 + rnd() * 1.6;
    if (left - w < MIN_W) w = left <= MAX_W ? left : left / 2; // never leave a sliver
    const floors = 2 + pick(4);
    houses.push({
      x0: x,
      w,
      floors,
      facade: FACADES[pick(FACADES.length)],
      open: rnd() < 0.75,
      sign: pick(SIGN_TEXTS.length),
      card: pick(4),
      storeys: Array.from({ length: floors }, () => ({
        lit: rnd() < 0.45,
        card: pick(4),
        balcony: rnd() < 0.7,
        plant: rnd() < 0.6,
        ac: rnd() < 0.6,
      })),
    });
    x += w;
  }
  return houses;
};

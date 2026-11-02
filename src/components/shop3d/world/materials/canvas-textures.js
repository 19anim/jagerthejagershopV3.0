import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { SIGN_TEXTS } from "../../../../utils/shop3d/street-gen";

const make = (width, height, draw, { repeat = false } = {}) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"), width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  if (repeat) texture.wrapS = texture.wrapT = RepeatWrapping;
  return texture;
};

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const speckle = (g, w, h, n, alpha, colours) => {
  for (let i = 0; i < n; i++) {
    g.globalAlpha = alpha * rnd();
    g.fillStyle = colours[Math.floor(rnd() * colours.length)];
    g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  g.globalAlpha = 1;
};

// Remap a PlaneGeometry's UVs into one cell of a cols×rows atlas (row 0 = top).
export const atlasUV = (geometry, { col = 0, row = 0, cols = 1, rows = 1 }) => {
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (col + uv.getX(i)) / cols, 1 - (row + 1 - uv.getY(i)) / rows);
  }
  uv.needsUpdate = true;
  return geometry;
};

export const signAtlasTexture = () =>
  make(1024, 1024, (g) => {
    SIGN_TEXTS.forEach(([text, bg, fg], row) => {
      const y = row * 128;
      g.fillStyle = bg;
      g.fillRect(0, y, 1024, 128);
      g.strokeStyle = "rgba(255,255,255,0.18)";
      g.lineWidth = 6;
      g.strokeRect(8, y + 8, 1008, 112);
      g.fillStyle = fg;
      g.font = "700 74px Arial, Helvetica, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(text, 512, y + 68);
    });
  });

const ROOM_HUES = ["#ffe3b0", "#e8f3ff", "#ffd9c2", "#fff0d0"];
// Four lit-interior cards side by side (each 256 px wide): warm rooms seen through glass.
export const roomCardAtlasTexture = () =>
  make(1024, 256, (g) => {
    ROOM_HUES.forEach((hue, i) => {
      const x = i * 256;
      const grad = g.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, hue);
      grad.addColorStop(1, "#3b2a1c");
      g.fillStyle = grad;
      g.fillRect(x, 0, 256, 256);
      g.fillStyle = "rgba(40,25,15,0.65)";
      g.fillRect(x + 10 + rnd() * 90, 120, 70 + rnd() * 60, 136);
      g.fillRect(x + 170 + rnd() * 40, 80, 22, 176);
      g.fillStyle = "rgba(255,245,215,0.65)";
      g.fillRect(x + 100, 0, 56, 8);
    });
  });

export const shutterTexture = () =>
  make(128, 256, (g, w, h) => {
    for (let y = 0; y < h; y += 8) {
      g.fillStyle = "#a3a8ab";
      g.fillRect(0, y, w, 6);
      g.fillStyle = "#6b7073";
      g.fillRect(0, y + 6, w, 2);
    }
    speckle(g, w, h, 1500, 0.3, ["#555", "#ccc", "#8a7a6a"]);
  });

// Cardboard case of six bottles (bottom shelves).
export const caseTexture = () =>
  make(256, 256, (g, w, h) => {
    g.fillStyle = "#b38a5a";
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 3000, 0.25, ["#8b6a43", "#c9a273"]);
    g.fillStyle = "#1e3027";
    g.fillRect(0, 90, w, 70);
    g.fillStyle = "#f3efe3";
    g.font = "700 30px Arial, sans-serif";
    g.textAlign = "center";
    g.fillText("JÄGERMEISTER", w / 2, 136);
    g.fillStyle = "#dd5a12";
    g.fillRect(0, 160, w, 8);
  });

export const textTexture = ({ text, width = 512, height = 128, bg = "#1e3027", fg = "#f3efe3", font = "700 64px Arial, sans-serif", border }) =>
  make(width, height, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, width, height);
    if (border) {
      g.strokeStyle = border;
      g.lineWidth = Math.max(4, height * 0.06);
      g.strokeRect(g.lineWidth, g.lineWidth, width - 2 * g.lineWidth, height - 2 * g.lineWidth);
    }
    g.fillStyle = fg;
    g.font = font;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const lines = String(text).split("\n");
    const step = height / (lines.length + 1);
    lines.forEach((line, i) => g.fillText(line, width / 2, step * (i + 1)));
  });

// The shop sign: green board, gold border, logo on the left, name on the right.
export const shopSignTexture = (logoUrl) => {
  let texture;
  const draw = (g, w, h, logo) => {
    g.fillStyle = "#16241d";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#b8922e";
    g.lineWidth = 10;
    g.strokeRect(8, 8, w - 16, h - 16);
    if (logo) g.drawImage(logo, 28, 14, (h - 28) * (logo.width / logo.height), h - 28);
    g.fillStyle = "#f3d48a";
    g.font = "700 92px Georgia, 'Times New Roman', serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("JÄGER THE JÄGER", w / 2 + 90, h / 2 + 4);
  };
  texture = make(1280, 180, (g, w, h) => draw(g, w, h, null));
  const image = new Image();
  image.onload = () => {
    draw(texture.image.getContext("2d"), texture.image.width, texture.image.height, image);
    texture.needsUpdate = true;
  };
  image.src = logoUrl;
  return texture;
};

// Vintage-style posters (stag, bottle, "since 1934"). Variant picks the palette.
export const posterTexture = (variant = 0) =>
  make(256, 360, (g, w, h) => {
    const [bg, ink, accent] = [["#efe2c4", "#1e3027", "#dd5a12"], ["#1e3027", "#f3efe3", "#b8922e"], ["#dd5a12", "#f3efe3", "#1e3027"]][variant % 3];
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 2500, 0.18, ["#000", "#fff"]);
    g.fillStyle = accent;
    g.beginPath();
    g.arc(w / 2, 150, 82, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = 7;
    g.beginPath(); // stag head with antlers
    g.moveTo(w / 2, 205); g.lineTo(w / 2 - 22, 150); g.lineTo(w / 2, 120); g.lineTo(w / 2 + 22, 150); g.closePath();
    g.moveTo(w / 2 - 14, 125); g.lineTo(w / 2 - 50, 80); g.lineTo(w / 2 - 66, 92);
    g.moveTo(w / 2 - 38, 96); g.lineTo(w / 2 - 44, 70);
    g.moveTo(w / 2 + 14, 125); g.lineTo(w / 2 + 50, 80); g.lineTo(w / 2 + 66, 92);
    g.moveTo(w / 2 + 38, 96); g.lineTo(w / 2 + 44, 70);
    g.stroke();
    g.fillStyle = ink;
    g.textAlign = "center";
    g.font = "700 27px Georgia, serif";
    g.fillText(["JÄGERMEISTER", "56 HERBS", "ICE COLD"][variant % 3], w / 2, 285);
    g.font = "400 20px Georgia, serif";
    g.fillText(["SINCE 1934", "WOLFENBÜTTEL", "-18°C"][variant % 3], w / 2, 318);
  });

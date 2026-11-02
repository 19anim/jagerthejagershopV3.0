/*
 * Builds the 3D shop's people (src/assets/people/worker.glb and worker-female.glb) from two CC0 packs by
 * Quaternius. Adapted from the workshop app's build-worker-glb.mjs: --body picks the male or female base body
 * (the female one uses Superhero_Female_FullBody, Hair_Long, Hair_Buns and Eyebrows_Female).
 * Not part of the app build or the tests: run it by hand when a model has to be rebuilt.
 *
 * Inputs (CC0, https://quaternius.com):
 *   - Universal Base Characters [Standard], https://quaternius.itch.io/universal-base-characters
 *       Base Characters/Godot - UE/Superhero_Male_FullBody.gltf (+ .bin, PNG textures)
 *       Hairstyles/Rigged to Head Bone/glTF (Godot -Unreal)/Hair_Beard, Hair_SimpleParted, Hair_Buzzed, Eyebrows_Regular
 *   - Universal Animation Library [Standard], https://quaternius.itch.io/universal-animation-library
 *       Unreal-Godot/UAL1_Standard.glb (in-place clips; not the _RM root-motion file)
 *
 * What it does:
 *   - keeps the male body, eyes and the hair meshes on one 65-joint skin, named body, eyes, brows,
 *     hair_beard, hair_parted, hair_buzzed so code can toggle them (brows is the body file's own eyebrow mesh,
 *     checked to be identical to Eyebrows_Regular);
 *   - splits the body into MI_Skin (head, neck, hands: the authored texture), MI_Suit (torso and limbs, tinted
 *     per worker) and MI_Accent (the shorts and the feet, tinted with the accent colour), cutting triangles
 *     along the skin weights so the seams are smooth;
 *   - gives MI_Hair a dark brown base colour (the pack tints hair through a vertex colour viewers ignore);
 *   - copies the UAL clips onto the male skeleton by joint name: rotations as they are (both rigs share the
 *     UE-style names and a T-pose within a few degrees), the pelvis translation scaled to the male hip height,
 *     every other translation and all scales dropped so the male proportions stay.
 *
 * Run (from a scratch folder outside the repo, never from inside the packs):
 *   (the shipped model was made with glTF-Transform 4.5.1, three 0.170.0 and pngjs 7.0.0)
 *   npm i @gltf-transform/core@4.5.1 @gltf-transform/extensions@4.5.1 @gltf-transform/functions@4.5.1 three@0.170.0 pngjs@7.0.0
 *   node build-people-glb.mjs --body female --ubc "<...>/Universal Base Characters[Standard]" \
 *     --ual "<...>/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb" --out worker-female-raw.glb
 *   npx -y @gltf-transform/cli@4.5.1 optimize worker-female-raw.glb worker-female-opt.glb --compress false --texture-compress webp \
 *     --texture-size 1024 --join false --palette false --simplify false
 *   npx -y @gltf-transform/cli@4.5.1 meshopt worker-female-opt.glb src/assets/people/worker-female.glb --quantization-volume scene
 *   npx -y @gltf-transform/cli@4.5.1 inspect src/assets/people/worker-female.glb
 *
 * Why two steps: optimize quantizes each mesh in its own volume, which clones the skin per mesh (6 skins);
 * meshopt with a scene-wide volume keeps one shared skin. join/palette stay off so the hair meshes and the
 * MI_Suit / MI_Accent materials survive as separate, named parts; simplify stays off to keep the face intact.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { NodeIO } from '@gltf-transform/core';
import { prune } from '@gltf-transform/functions';
import { PNG } from 'pngjs';
import * as THREE from 'three';

const { values: args } = parseArgs({ options: { body: { type: 'string', default: 'male' }, ubc: { type: 'string' }, ual: { type: 'string' }, out: { type: 'string' } } });
if (!args.ubc || !args.ual || !args.out) throw new Error('usage: --body male|female --ubc <pack dir> --ual <UAL1_Standard.glb> --out <file.glb>');

// What differs between the two UBC bodies: file, mesh and material names, and which hair meshes to rig.
const BODIES = {
  male: {
    file: 'Superhero_Male_FullBody.gltf', body: 'Sphere.005_Retopology.004', eyes: 'Face.001', brows: 'Face',
    skinMat: 'MI_Superhero_Male', hairMat: 'MI_Hair_1', browsRef: 'Eyebrows_Regular',
    hair: { Hair_Beard: 'hair_beard', Hair_SimpleParted: 'hair_parted', Hair_Buzzed: 'hair_buzzed' },
  },
  female: {
    file: 'Superhero_Female_FullBody.gltf', body: 'Superhero_Female', eyes: 'Eyes', brows: 'Eyebrows',
    skinMat: 'MI_Superhero_Female', hairMat: 'MI_Hair_2', browsRef: 'Eyebrows_Female',
    hair: { Hair_Long: 'hair_long', Hair_Buns: 'hair_buns' },
  },
};
const BODY = BODIES[args.body];
if (!BODY) throw new Error(`--body must be one of ${Object.keys(BODIES).join(', ')}`);

const CLIPS = ['Idle_Loop', 'Idle_Talking_Loop', 'Walk_Loop', 'Jog_Fwd_Loop', 'Interact', 'PickUp_Table', 'Sitting_Enter', 'Sitting_Idle_Loop', 'Sitting_Talking_Loop', 'Sitting_Exit', 'Dance_Loop'];
const HAIR_COLOR = [0.04, 0.02, 0.01, 1]; // the pack's COLOR_1 hair tint, which glTF viewers ignore

const io = new NodeIO();

/**
 * A URI from a pack's .gltf as a file inside the pack folder. Anything else is refused: an absolute path, a scheme
 * (data:, http:, file:) or a ../ way out, which a crafted pack could use to pull any local file into the model
 */
function inPack(dir, uri) {
  if (typeof uri !== 'string' || /^[a-z][a-z0-9+.-]*:/i.test(uri)) throw new Error(`readLoose: not a relative file URI: ${uri}`);
  const root = path.resolve(dir);
  const file = path.resolve(root, decodeURIComponent(uri));
  const rel = path.relative(root, file);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) throw new Error(`readLoose: ${uri} is outside ${root}`);
  return file;
}

/** Reads a .gltf whose image URIs may be wrong in the pack (X_png.png for X.png) */
async function readLoose(file) {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const dir = path.dirname(file);
  const resources = {};
  for (const b of json.buffers ?? []) resources[b.uri] = fs.readFileSync(inPack(dir, b.uri));
  for (const im of json.images ?? []) {
    if (!fs.existsSync(inPack(dir, im.uri))) im.uri = im.uri.replace(/_png\.png$/, '.png');
    resources[im.uri] = fs.readFileSync(inPack(dir, im.uri));
  }
  return io.readJSON({ json, resources });
}

const ubc = args.ubc;
const doc = await readLoose(path.join(ubc, 'Base Characters/Godot - UE', BODY.file));
const root = doc.getRoot();
const buffer = root.listBuffers()[0];
const skin = root.listSkins()[0];
const joints = skin.listJoints();
const jointIndex = new Map(joints.map((j, i) => [j.getName(), i]));
const ibm = (s, i) => new THREE.Matrix4().fromArray(s.getInverseBindMatrices().getElement(i, []));

const nodeByMesh = (name) => root.listNodes().find((n) => n.getMesh()?.getName() === name);
const bodyNode = nodeByMesh(BODY.body);
const eyesNode = nodeByMesh(BODY.eyes);
const browsNode = nodeByMesh(BODY.brows);
const armature = root.listScenes()[0].listChildren()[0];

// unused vertex streams: white vertex colours (they would switch on vertexColors) and spare UV sets
for (const mesh of root.listMeshes())
  for (const p of mesh.listPrimitives())
    for (const s of ['COLOR_0', 'COLOR_1', 'TEXCOORD_1', 'TEXCOORD_2', 'TEXCOORD_3']) p.setAttribute(s, null);

bodyNode.setName('body');
bodyNode.getMesh().setName('body');
eyesNode.setName('eyes');
eyesNode.getMesh().setName('eyes');
browsNode.setName('brows');
browsNode.getMesh().setName('brows');

// ---------- materials ----------
const matByName = (n) => root.listMaterials().find((m) => m.getName() === n);
const skinMat = matByName(BODY.skinMat).setName('MI_Skin');
const hairMat = matByName(BODY.hairMat).setName('MI_Hair').setBaseColorFactor(HAIR_COLOR);
const suitMat = doc.createMaterial('MI_Suit').setBaseColorFactor([0.5, 0.5, 0.5, 1]).setMetallicFactor(0).setRoughnessFactor(0.4).setNormalTexture(skinMat.getNormalTexture()).setDoubleSided(true);
const accentMat = doc.createMaterial('MI_Accent').setBaseColorFactor([0.8, 0.5, 0.15, 1]).setMetallicFactor(0).setRoughnessFactor(0.45).setNormalTexture(skinMat.getNormalTexture()).setDoubleSided(true);

// ---------- split the body: skin (head, neck, hands), accent (shorts, feet), suit (the rest) ----------
const baseTex = PNG.sync.read(Buffer.from(skinMat.getBaseColorTexture().getImage()));
const texel = (u, v) => {
  const x = Math.min(baseTex.width - 1, Math.max(0, Math.floor((u - Math.floor(u)) * baseTex.width)));
  const y = Math.min(baseTex.height - 1, Math.max(0, Math.floor((v - Math.floor(v)) * baseTex.height)));
  const o = (y * baseTex.width + x) * 4;
  return [baseTex.data[o], baseTex.data[o + 1], baseTex.data[o + 2]];
};
// Seams follow the skin weights: a vertex is "skin" by its weight on the head, neck and hand joints and a "shoe" by
// its weight on the foot joints. Triangles that straddle the 0.5 line are cut there (new vertices interpolated), so
// the collar, cuffs and ankles are smooth lines instead of triangle steps.
const SKIN_JOINTS = /^(Head|neck_01|hand_[lr]|(index|middle|ring|pinky|thumb)_\d\d(_leaf)?_[lr])$/;
const FOOT_JOINTS = /^(foot|ball|ball_leaf)_[lr]$/;
{
  const prim = bodyNode.getMesh().listPrimitives()[0];
  const NAMES = ['POSITION', 'NORMAL', 'TEXCOORD_0'];
  const attr = Object.fromEntries(NAMES.map((n) => [n, prim.getAttribute(n)]));
  const J = prim.getAttribute('JOINTS_0'), W = prim.getAttribute('WEIGHTS_0');
  const V = []; // { a: {POSITION:[..],...}, w: Map(joint -> weight) }
  for (let i = 0; i < J.getCount(); i++) {
    const a = Object.fromEntries(NAMES.map((n) => [n, attr[n].getElement(i, [])]));
    const j = J.getElement(i, []), w = W.getElement(i, []);
    const map = new Map();
    for (let k = 0; k < 4; k++) if (w[k] > 0) map.set(j[k], (map.get(j[k]) ?? 0) + w[k]);
    V.push({ a, w: map });
  }
  const field = (re) => (v) => {
    let s = 0;
    for (const [j, w] of v.w) if (re.test(joints[j].getName())) s += w;
    return s - 0.5;
  };
  const edgeCache = new Map();
  function splitVertex(i, k, f) {
    const key = `${Math.min(i, k)}_${Math.max(i, k)}_${f.id}`;
    if (edgeCache.has(key)) return edgeCache.get(key);
    const A = V[i], B = V[k], sa = f(A), sb = f(B), t = sa / (sa - sb);
    const a = {};
    for (const n of NAMES) a[n] = A.a[n].map((x, c) => x + (B.a[n][c] - x) * t);
    const len = Math.hypot(...a.NORMAL) || 1;
    a.NORMAL = a.NORMAL.map((x) => x / len);
    const w = new Map();
    for (const [j, x] of A.w) w.set(j, (w.get(j) ?? 0) + x * (1 - t));
    for (const [j, x] of B.w) w.set(j, (w.get(j) ?? 0) + x * t);
    V.push({ a, w });
    edgeCache.set(key, V.length - 1);
    return V.length - 1;
  }
  /** Splits triangles by the sign of f: returns [inside (f >= 0), outside] */
  function cut(tris, f) {
    const pos = [], neg = [];
    for (const tri of tris) {
      const s = tri.map((i) => f(V[i]) >= 0);
      const n = s.filter(Boolean).length;
      if (n === 3) pos.push(tri);
      else if (n === 0) neg.push(tri);
      else {
        // rotate so the lone vertex comes first, keeping the winding
        const lone = n === 1 ? s.indexOf(true) : s.indexOf(false);
        const [a, b, c] = [tri[lone], tri[(lone + 1) % 3], tri[(lone + 2) % 3]];
        const ab = splitVertex(a, b, f), ac = splitVertex(a, c, f);
        const one = [[a, ab, ac]], two = [[ab, b, c], [ab, c, ac]];
        if (n === 1) (pos.push(...one), neg.push(...two));
        else (neg.push(...one), pos.push(...two));
      }
    }
    return [pos, neg];
  }
  const skinF = Object.assign(field(SKIN_JOINTS), { id: 's' });
  const footF = Object.assign(field(FOOT_JOINTS), { id: 'f' });
  const idx = prim.getIndices().getArray();
  const all = [];
  for (let t = 0; t < idx.length; t += 3) all.push([idx[t], idx[t + 1], idx[t + 2]]);
  const [skinTris, rest] = cut(all, skinF);
  const [feet, clothes] = cut(rest, footF);
  const shorts = [], suit = [];
  for (const tri of clothes) {
    let u = 0, v = 0;
    for (const i of tri) (u += V[i].a.TEXCOORD_0[0] / 3), (v += V[i].a.TEXCOORD_0[1] / 3);
    const [r, g, b] = texel(u, v);
    (r < 100 && g < 100 && b < 100 && Math.abs(r - b) < 25 ? shorts : suit).push(tri); // the dark grey shorts in the atlas
  }
  // one vertex set for the three parts
  const acc = (type, arr, src) => doc.createAccessor().setType(type).setArray(arr).setNormalized(src?.getNormalized() ?? false).setBuffer(buffer);
  for (const n of NAMES) prim.setAttribute(n, acc(attr[n].getType(), new Float32Array(V.flatMap((v) => v.a[n]))));
  const jArr = new Uint16Array(V.length * 4), wArr = new Float32Array(V.length * 4);
  V.forEach((v, i) => {
    const top = [...v.w.entries()].sort((x, y) => y[1] - x[1]).slice(0, 4);
    const sum = top.reduce((s, [, w]) => s + w, 0);
    top.forEach(([j, w], k) => ((jArr[i * 4 + k] = j), (wArr[i * 4 + k] = w / sum)));
  });
  prim.setAttribute('JOINTS_0', acc('VEC4', jArr)).setAttribute('WEIGHTS_0', acc('VEC4', wArr));
  const mesh = bodyNode.getMesh();
  const parts = { skin: [skinTris, skinMat], suit: [suit, suitMat], accent: [[...feet, ...shorts], accentMat] };
  for (const [kind, [tris, mat]] of Object.entries(parts)) {
    const p = kind === 'skin' ? prim : prim.clone();
    p.setIndices(acc('SCALAR', new Uint32Array(tris.flat()))).setMaterial(mat);
    if (p !== prim) mesh.addPrimitive(p);
  }
  console.log('body split (triangles):', Object.fromEntries(Object.entries(parts).map(([k, [t]]) => [k, t.length])), 'vertices', J.getCount(), '->', V.length);
}

// ---------- hair meshes, rebound to the male skin ----------
const hairDir = path.join(ubc, 'Hairstyles/Rigged to Head Bone/glTF (Godot -Unreal)');
function copyAccessor(a, array) {
  return doc.createAccessor().setType(a.getType()).setArray(array ?? a.getArray().slice()).setNormalized(a.getNormalized()).setBuffer(buffer);
}
async function importHair(file, name) {
  const src = await readLoose(path.join(hairDir, file + '.gltf'));
  const sSkin = src.getRoot().listSkins()[0];
  const sNames = sSkin.listJoints().map((j) => j.getName());
  const sNode = src.getRoot().listNodes().find((n) => n.getMesh());
  const sPrim = sNode.getMesh().listPrimitives()[0];
  const J = sPrim.getAttribute('JOINTS_0'), W = sPrim.getAttribute('WEIGHTS_0');
  const P = sPrim.getAttribute('POSITION'), N = sPrim.getAttribute('NORMAL');
  const pos = new Float32Array(P.getCount() * 3), nrm = new Float32Array(N.getCount() * 3), jnt = new Uint16Array(J.getCount() * 4);
  const j = [], w = [], v = new THREE.Vector3(), n = new THREE.Vector3();
  let moved = 0;
  for (let i = 0; i < P.getCount(); i++) {
    J.getElement(i, j);
    W.getElement(i, w);
    let b = 0;
    for (let k = 1; k < 4; k++) if (w[k] > w[b]) b = k;
    if (w[b] < 0.999) throw new Error(`${file}: vertex ${i} is not rigged to one bone only`);
    const bone = sNames[j[b]];
    const mi = jointIndex.get(bone);
    if (mi === undefined) throw new Error(`${file}: joint ${bone} is not in the male skin`);
    // same place relative to the bone: inverse(male IBM) * hair IBM
    const m = ibm(skin, mi).invert().multiply(ibm(sSkin, j[b]));
    v.fromArray(P.getElement(i, [])).applyMatrix4(m);
    moved = Math.max(moved, v.distanceTo(new THREE.Vector3().fromArray(P.getElement(i, []))));
    n.fromArray(N.getElement(i, [])).transformDirection(m);
    v.toArray(pos, i * 3);
    n.toArray(nrm, i * 3);
    for (let k = 0; k < 4; k++) jnt[i * 4 + k] = w[k] > 0 ? jointIndex.get(sNames[j[k]]) : 0;
  }
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', copyAccessor(P, pos))
    .setAttribute('NORMAL', copyAccessor(N, nrm))
    .setAttribute('TEXCOORD_0', copyAccessor(sPrim.getAttribute('TEXCOORD_0')))
    .setAttribute('JOINTS_0', copyAccessor(J, jnt))
    .setAttribute('WEIGHTS_0', copyAccessor(W))
    .setIndices(copyAccessor(sPrim.getIndices()))
    .setMaterial(hairMat);
  const node = doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)).setSkin(skin);
  armature.addChild(node);
  console.log(`hair ${file} -> ${name}: ${P.getCount()} verts, max shift into the male head space ${(moved * 1000).toFixed(2)} mm`);

}
for (const [file, name] of Object.entries(BODY.hair)) await importHair(file, name);
{
  // the body file already carries the regular eyebrows (same vertex count); check they match the pack's Eyebrows_Regular
  const src = await readLoose(path.join(hairDir, `${BODY.browsRef}.gltf`));
  const a = src.getRoot().listMeshes()[0].listPrimitives()[0].getAttribute('POSITION');
  const b = browsNode.getMesh().listPrimitives()[0].getAttribute('POSITION');
  let d = a.getCount() === b.getCount() ? 0 : Infinity;
  for (let i = 0; d < Infinity && i < a.getCount(); i++) d = Math.max(d, new THREE.Vector3().fromArray(a.getElement(i, [])).distanceTo(new THREE.Vector3().fromArray(b.getElement(i, []))));
  console.log(`brows: built-in eyebrows vs Eyebrows_Regular, max vertex distance ${(d * 1000).toFixed(3)} mm`);
  if (!(d < 0.001)) console.warn(`brows: built-in eyebrows differ from ${BODY.browsRef} by ${(d * 1000).toFixed(2)} mm; keeping the built-in mesh`);
}

// ---------- clips from the animation library, by joint name ----------
const ual = await io.read(args.ual);
const uJoints = Object.fromEntries(ual.getRoot().listSkins()[0].listJoints().map((j) => [j.getName(), j]));
const pelvisScale = joints[jointIndex.get('pelvis')].getTranslation()[2] / uJoints.pelvis.getTranslation()[2];
console.log('pelvis translation scale (male hip height / UAL hip height):', pelvisScale.toFixed(4));
for (const name of CLIPS) {
  const src = ual.getRoot().listAnimations().find((a) => a.getName() === name);
  if (!src) throw new Error(`clip ${name} is missing in the animation library`);
  const anim = doc.createAnimation(name);
  let channels = 0;
  for (const ch of src.listChannels()) {
    const bone = ch.getTargetNode().getName();
    const target = joints[jointIndex.get(bone)];
    if (!target) throw new Error(`clip ${name}: joint ${bone} is not in the male skin`);
    const pathName = ch.getTargetPath();
    if (pathName === 'scale') continue;
    if (pathName === 'translation' && bone !== 'pelvis') continue;
    const s = ch.getSampler();
    let out = s.getOutput().getArray().slice();
    if (pathName === 'translation') out = out.map((x) => x * pelvisScale);
    const sampler = doc
      .createAnimationSampler()
      .setInterpolation(s.getInterpolation())
      .setInput(copyAccessor(s.getInput()))
      .setOutput(doc.createAccessor().setType(s.getOutput().getType()).setArray(out).setBuffer(buffer));
    anim.addSampler(sampler).addChannel(doc.createAnimationChannel().setTargetNode(target).setTargetPath(pathName).setSampler(sampler));
    channels++;
  }
  console.log(`clip ${name}: ${channels} channels, ${src.listChannels()[0].getSampler().getInput().getMax([])[0].toFixed(2)} s`);
}

await doc.transform(prune());
await io.write(args.out, doc);
console.log('wrote', args.out, (fs.statSync(args.out).size / 1024).toFixed(0), 'KB');

import { createContext, useContext, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { MeshPhysicalMaterial, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace } from "three";
import { TEXTURE_URLS } from "./textures";
import { caseTexture, roomCardAtlasTexture, shutterTexture, signAtlasTexture } from "./canvas-textures";

// Metres covered by one texture repeat (used for world-space UVs on merged geometry).
export const UV_METRES = {
  asphalt: 4, paver: 1.6, kerb: 1.2, facadeWhite: 1.6, facadeCream: 1.6, facadeGrey: 1.6, facadeDark: 2.0,
  plasterOut: 2.5, oak: 2.2, brick: 1.8, plaster: 2.5, darkWood: 1.4,
};

const MaterialsContext = createContext(null);

export const MaterialsProvider = ({ children }) => {
  const t = useTexture(TEXTURE_URLS);
  const mats = useMemo(() => {
    for (const [key, texture] of Object.entries(t)) {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.anisotropy = 8;
      if (key.endsWith("Diff")) texture.colorSpace = SRGBColorSpace;
    }
    const std = (o) => new MeshStandardMaterial(o);
    const glassy = (o) => new MeshStandardMaterial({ roughness: 0.05, transparent: true, depthWrite: false, ...o });
    const signAtlas = signAtlasTexture();
    const roomCards = roomCardAtlasTexture();
    const m = {
      // street
      asphalt: std({ map: t.asphaltDiff, normalMap: t.asphaltNor, roughness: 0.93, color: "#b5b5b5" }),
      paver: std({ map: t.paverDiff, normalMap: t.paverNor, roughness: 0.86 }),
      kerb: std({ map: t.plasterDiff, color: "#9d9a92", roughness: 0.9 }),
      roadPaint: std({ color: "#e9e4d4", roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
      facadeWhite: std({ map: t.tilesWhiteDiff, normalMap: t.tilesWhiteNor, roughness: 0.45 }),
      facadeCream: std({ map: t.tilesWhiteDiff, normalMap: t.tilesWhiteNor, color: "#eadcc0", roughness: 0.5 }),
      facadeGrey: std({ map: t.tilesWhiteDiff, normalMap: t.tilesWhiteNor, color: "#b9c0c4", roughness: 0.5 }),
      facadeDark: std({ map: t.tilesDarkDiff, normalMap: t.tilesDarkNor, roughness: 0.55 }),
      plasterOut: std({ map: t.plasterDiff, color: "#d9d2c3", roughness: 0.92 }),
      glass: std({ color: "#1d2a36", metalness: 0.9, roughness: 0.06 }),
      frame: std({ color: "#2c3034", metalness: 0.6, roughness: 0.4 }),
      alu: std({ color: "#c7cbce", metalness: 0.7, roughness: 0.35 }),
      slab: std({ color: "#d6d3cc", roughness: 0.8 }),
      ac: std({ color: "#e9e9e4", roughness: 0.5 }),
      shutter: std({ map: shutterTexture(), metalness: 0.5, roughness: 0.5 }),
      railGlass: glassy({ color: "#9fb6c2", opacity: 0.3 }),
      leaf: std({ color: "#2f5b36", roughness: 0.9 }),
      trunk: std({ color: "#4a3b2c", roughness: 1 }),
      pole: std({ color: "#4d5257", metalness: 0.6, roughness: 0.45 }),
      tyre: std({ color: "#151515", roughness: 0.9 }),
      lampHead: std({ color: "#000000", emissive: "#ffd9a0", emissiveIntensity: 4 }),
      signAtlas: std({ map: signAtlas, emissive: "#ffffff", emissiveMap: signAtlas, emissiveIntensity: 0.9, roughness: 0.4 }),
      roomCards: std({ color: "#000000", emissive: "#ffffff", emissiveMap: roomCards, emissiveIntensity: 1.0, roughness: 0.2 }),
      // brand
      green: std({ color: "#1e3027", roughness: 0.55 }),
      greenMid: std({ color: "#31533e", roughness: 0.55 }),
      brass: std({ color: "#b8922e", metalness: 0.9, roughness: 0.28 }),
      orange: std({ color: "#dd5a12", roughness: 0.75 }),
      cream: std({ color: "#f3efe3", roughness: 0.6 }),
      black: std({ color: "#141414", roughness: 0.4, metalness: 0.5 }),
      // interior
      oak: std({ map: t.oakDiff, normalMap: t.oakNor, roughness: 0.42 }),
      brick: std({ map: t.brickDiff, normalMap: t.brickNor, roughness: 0.9 }),
      plaster: std({ map: t.plasterDiff, color: "#efe7d6", roughness: 0.92 }),
      darkWood: std({ map: t.darkWoodDiff, color: "#7a5a48", roughness: 0.5 }),
      ceiling: std({ color: "#24302a", roughness: 0.85 }),
      led: std({ color: "#000000", emissive: "#ffcf8a", emissiveIntensity: 3 }),
      coolLight: std({ color: "#000000", emissive: "#dff3ff", emissiveIntensity: 1.2 }),
      cardboard: std({ map: caseTexture(), roughness: 0.9 }),
      chillerGlass: glassy({ color: "#cfe3ea", opacity: 0.18, metalness: 0.1 }),
      shopGlass: glassy({ color: "#a9c3cc", opacity: 0.16, metalness: 0.2 }),
      smokedGlass: new MeshPhysicalMaterial({ color: "#1a2a20", roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }),
      leather: std({ color: "#2b3d31", roughness: 0.65 }),
      chalk: std({ color: "#1c1f1d", roughness: 0.95 }),
      interiorCard: std({ color: "#000000", emissive: "#ffffff", emissiveMap: roomCards, emissiveIntensity: 0.8 }),
    };
    m.led.userData.noShadow = true;
    m.coolLight.userData.noShadow = true;
    m.lampHead.userData.noShadow = true;
    m.roadPaint.userData.noShadow = true;
    return m;
  }, [t]);
  return <MaterialsContext.Provider value={mats}>{children}</MaterialsContext.Provider>;
};

export const useMats = () => useContext(MaterialsContext);

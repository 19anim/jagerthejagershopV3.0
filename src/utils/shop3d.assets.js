// import.meta.glob handles the folder names that contain spaces, and returns
// hashed bundle URLs. Keyed by the raw path, we re-key by base filename.
const modules = import.meta.glob("../assets/jager-3d-glb/**/*.glb", {
  eager: true,
  query: "?url",
  import: "default",
});

export const GLB_URLS = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [path.split("/").pop(), url])
);

export const getGlbUrl = (fileName) => {
  const url = GLB_URLS[fileName];
  if (!url) throw new Error(`Unknown GLB asset: ${fileName}`);
  return url;
};

// Two quality tiers. Picked once from the device (or ?quality=), and dropped to
// "low" by the performance monitor if the frame rate sags; never raised mid-visit.
export const QUALITY = {
  high: { tier: "high", dpr: [1, 2], shadowMapSize: 2048, bloom: true, lampLights: true, maxDepth: 2, maxInstances: 1800, interiorAlways: true, peopleAlways: true, farDetail: true },
  low: { tier: "low", dpr: [1, 1.25], shadowMapSize: 1024, bloom: false, lampLights: false, maxDepth: 1, maxInstances: 450, interiorAlways: false, peopleAlways: false, farDetail: false },
};

export const detectTier = (env) => {
  if (!env) return "high";
  const forced = new URLSearchParams(env.location?.search || "").get("quality");
  if (forced === "low" || forced === "high") return forced;
  if (env.matchMedia?.("(pointer: coarse)")?.matches) return "low";
  const memory = env.navigator?.deviceMemory;
  if (typeof memory === "number" && memory <= 4) return "low";
  return "high";
};

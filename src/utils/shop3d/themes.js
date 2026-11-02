// Which seasonal decor the 3D shop shows. An admin can pick one; "auto" (or no
// answer from the backend) picks by the calendar date in Vietnam.

export const THEMES = ["tet", "christmas", "midautumn", "halloween"];
export const THEME_SETTINGS = ["auto", "none", ...THEMES];

// Lunar new year (Tết) and the 15th day of the 8th lunar month (Trung Thu), Vietnam.
export const TET_DATES = {
  2026: "2026-02-17", 2027: "2027-02-06", 2028: "2028-01-26", 2029: "2029-02-13", 2030: "2030-02-03",
  2031: "2031-01-23", 2032: "2032-02-11", 2033: "2033-01-31", 2034: "2034-02-19", 2035: "2035-02-08",
  2036: "2036-01-28", 2037: "2037-02-15", 2038: "2038-02-04", 2039: "2039-01-24", 2040: "2040-02-12",
};
export const MIDAUTUMN_DATES = {
  2026: "2026-09-25", 2027: "2027-09-15", 2028: "2028-10-03", 2029: "2029-09-22", 2030: "2030-09-12",
  2031: "2031-10-01", 2032: "2032-09-19", 2033: "2033-09-08", 2034: "2034-09-27", 2035: "2035-09-16",
  2036: "2036-10-04", 2037: "2037-09-24", 2038: "2038-09-13", 2039: "2039-10-02", 2040: "2040-09-20",
};

const DAY_MS = 86400000;
const VN_OFFSET_MS = 7 * 3600000;

const vietnamDay = (now) => {
  const t = new Date(now.getTime() + VN_OFFSET_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
};
const dayNumber = ({ y, m, d }) => Date.UTC(y, m - 1, d) / DAY_MS;
const isoDay = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return dayNumber({ y, m, d });
};
const within = (today, iso, before, after) => {
  if (!iso) return false;
  const centre = isoDay(iso);
  return today >= centre - before && today <= centre + after;
};

export const themeByDate = (now) => {
  const vd = vietnamDay(now);
  const today = dayNumber(vd);
  // Next year's Tết window can start on Dec 31, so check both years.
  if (within(today, TET_DATES[vd.y], 21, 7) || within(today, TET_DATES[vd.y + 1], 21, 7)) return "tet";
  if (within(today, MIDAUTUMN_DATES[vd.y], 14, 2)) return "midautumn";
  if (vd.m === 12) return "christmas";
  if (vd.m === 10 && vd.d >= 20) return "halloween";
  return null;
};

export const resolveTheme = (setting, now = new Date(), override) => {
  if (override === "none") return null;
  if (THEMES.includes(override)) return override;
  if (THEMES.includes(setting)) return setting;
  if (setting === undefined || setting === null || setting === "auto") return themeByDate(now);
  return null; // "none", or a value this build does not know
};

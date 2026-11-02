import { describe, expect, it } from "vitest";
import { resolveTheme, themeByDate, THEME_SETTINGS } from "./themes";

// Instants given in Vietnam time (UTC+7).
const vn = (iso) => new Date(`${iso}T00:30:00+07:00`);

describe("themeByDate", () => {
  it("covers Tết from 21 days before to 7 days after the lunar new year", () => {
    expect(themeByDate(vn("2027-01-16"))).toBe("tet"); // Tết 2027-02-06
    expect(themeByDate(vn("2027-02-13"))).toBe("tet");
    expect(themeByDate(vn("2027-01-15"))).toBe(null);
    expect(themeByDate(vn("2027-02-14"))).toBe(null);
  });

  it("covers Christmas through December", () => {
    expect(themeByDate(vn("2026-12-01"))).toBe("christmas");
    expect(themeByDate(vn("2026-12-31"))).toBe("christmas");
    expect(themeByDate(vn("2026-11-30"))).toBe(null);
  });

  it("covers Mid-Autumn from 14 days before to 2 days after", () => {
    expect(themeByDate(vn("2026-09-11"))).toBe("midautumn"); // 2026-09-25
    expect(themeByDate(vn("2026-09-27"))).toBe("midautumn");
    expect(themeByDate(vn("2026-09-28"))).toBe(null);
  });

  it("covers Halloween from Oct 20 to 31", () => {
    expect(themeByDate(vn("2026-10-20"))).toBe("halloween");
    expect(themeByDate(vn("2026-10-31"))).toBe("halloween");
    expect(themeByDate(vn("2026-10-19"))).toBe(null);
  });

  it("uses Vietnam time, not UTC", () => {
    expect(themeByDate(new Date("2026-11-30T17:30:00Z"))).toBe("christmas"); // 00:30 Dec 1 in Saigon
  });
});

describe("resolveTheme", () => {
  const now = vn("2026-06-01");
  it("returns an admin-picked theme regardless of date", () => {
    expect(resolveTheme("tet", now)).toBe("tet");
  });
  it("returns null for none", () => {
    expect(resolveTheme("none", vn("2026-12-10"))).toBe(null);
  });
  it("falls back to the date for auto or a missing value", () => {
    expect(resolveTheme("auto", vn("2026-12-10"))).toBe("christmas");
    expect(resolveTheme(undefined, vn("2026-12-10"))).toBe("christmas");
  });
  it("shows no theme for a value it does not know", () => {
    expect(resolveTheme("bogus", vn("2026-12-10"))).toBe(null);
  });
  it("lets a ?theme= override win", () => {
    expect(resolveTheme("none", now, "halloween")).toBe("halloween");
    expect(resolveTheme("tet", now, "none")).toBe(null);
    expect(resolveTheme("tet", now, "bogus")).toBe("tet");
  });
  it("lists the admin choices", () => {
    expect(THEME_SETTINGS).toEqual(["auto", "none", "tet", "christmas", "midautumn", "halloween"]);
  });
});

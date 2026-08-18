import { describe, expect, it, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useShopMode, SHOP_MODE, SHOP_MODE_STORAGE_KEY } from "./useShopMode.hook";

describe("useShopMode", () => {
  beforeEach(() => localStorage.clear());

  it("starts unchosen when nothing stored", () => {
    const { result } = renderHook(() => useShopMode());
    expect(result.current.mode).toBeNull();
    expect(result.current.hasChosen).toBe(false);
  });

  it("reads an existing stored mode", () => {
    localStorage.setItem(SHOP_MODE_STORAGE_KEY, SHOP_MODE.THREE_D);
    const { result } = renderHook(() => useShopMode());
    expect(result.current.mode).toBe("3d");
    expect(result.current.hasChosen).toBe(true);
  });

  it("persists a chosen mode", () => {
    const { result } = renderHook(() => useShopMode());
    act(() => result.current.setMode(SHOP_MODE.CLASSIC));
    expect(result.current.mode).toBe("classic");
    expect(localStorage.getItem(SHOP_MODE_STORAGE_KEY)).toBe("classic");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem(SHOP_MODE_STORAGE_KEY, "banana");
    const { result } = renderHook(() => useShopMode());
    expect(result.current.mode).toBeNull();
  });
});

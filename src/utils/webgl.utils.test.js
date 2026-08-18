import { describe, expect, it, vi } from "vitest";
import { isWebGLAvailable } from "./webgl.utils";

describe("isWebGLAvailable", () => {
  it("returns true when a webgl context is returned", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({});
    expect(isWebGLAvailable()).toBe(true);
  });

  it("returns false when no context can be created", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(isWebGLAvailable()).toBe(false);
  });

  it("returns false when getContext throws", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => {
      throw new Error("no webgl");
    });
    expect(isWebGLAvailable()).toBe(false);
  });
});

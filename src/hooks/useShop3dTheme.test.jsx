import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useShop3dTheme } from "./useShop3dTheme.hook";
import { settingsApi } from "../services/settings.api";

vi.mock("../services/settings.api", () => ({ settingsApi: { getShop3dTheme: vi.fn(), setShop3dTheme: vi.fn() } }));

const june = new Date("2026-06-01T12:00:00+07:00");
const december = new Date("2026-12-10T12:00:00+07:00");
const wrap = (entry = "/vi/shop3d") => {
  const Wrapper = ({ children }) => <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>;
  return Wrapper;
};

describe("useShop3dTheme", () => {
  beforeEach(() => { vi.mocked(settingsApi.getShop3dTheme).mockReset(); });

  it("uses the admin setting from the backend", async () => {
    vi.mocked(settingsApi.getShop3dTheme).mockResolvedValue({ shop3dTheme: "tet" });
    const { result } = renderHook(() => useShop3dTheme(june), { wrapper: wrap() });
    await waitFor(() => expect(result.current).toBe("tet"));
  });

  it("falls back to the date when the backend fails", async () => {
    vi.mocked(settingsApi.getShop3dTheme).mockImplementation(() => Promise.reject(new Error("404")));
    const { result } = renderHook(() => useShop3dTheme(december), { wrapper: wrap() });
    await waitFor(() => expect(settingsApi.getShop3dTheme).toHaveBeenCalled());
    await act(async () => {}); // let the rejection settle
    expect(result.current).toBe("christmas");
  });

  it("lets ?theme= override everything", async () => {
    vi.mocked(settingsApi.getShop3dTheme).mockResolvedValue({ shop3dTheme: "none" });
    const { result } = renderHook(() => useShop3dTheme(june), { wrapper: wrap("/vi/shop3d?theme=halloween") });
    await waitFor(() => expect(settingsApi.getShop3dTheme).toHaveBeenCalled());
    expect(result.current).toBe("halloween");
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Shop3dThemeSelect from "./shop3d-theme-select.component";
import { LocaleProvider } from "../../context/locale.context";
import { settingsApi } from "../../services/settings.api";

vi.mock("../../services/settings.api", () => ({ settingsApi: { getShop3dTheme: vi.fn(), setShop3dTheme: vi.fn() } }));

const renderSelect = () =>
  render(
    <BrowserRouter>
      <LocaleProvider>
        <Shop3dThemeSelect />
      </LocaleProvider>
    </BrowserRouter>
  );

describe("Shop3dThemeSelect", () => {
  beforeEach(() => {
    vi.mocked(settingsApi.getShop3dTheme).mockResolvedValue({ shop3dTheme: "christmas" });
    vi.mocked(settingsApi.setShop3dTheme).mockReset();
  });

  it("shows the current setting and every choice", async () => {
    renderSelect();
    const select = screen.getByLabelText("Chủ đề cửa hàng 3D");
    await waitFor(() => expect(select).toHaveValue("christmas"));
    expect(screen.getAllByRole("option")).toHaveLength(6);
  });

  it("saves a new choice", async () => {
    vi.mocked(settingsApi.setShop3dTheme).mockResolvedValue({ shop3dTheme: "tet" });
    renderSelect();
    const select = screen.getByLabelText("Chủ đề cửa hàng 3D");
    await waitFor(() => expect(select).toHaveValue("christmas"));
    fireEvent.change(select, { target: { value: "tet" } });
    expect(settingsApi.setShop3dTheme).toHaveBeenCalledWith("tet");
    expect(await screen.findByRole("status")).toHaveTextContent("Đã lưu chủ đề.");
  });

  it("reverts and says so when saving fails", async () => {
    vi.mocked(settingsApi.setShop3dTheme).mockImplementation(() => Promise.reject(new Error("403")));
    renderSelect();
    const select = screen.getByLabelText("Chủ đề cửa hàng 3D");
    await waitFor(() => expect(select).toHaveValue("christmas"));
    fireEvent.change(select, { target: { value: "none" } });
    expect(await screen.findByRole("status")).toHaveTextContent("Không lưu được chủ đề.");
    expect(select).toHaveValue("christmas");
  });
});

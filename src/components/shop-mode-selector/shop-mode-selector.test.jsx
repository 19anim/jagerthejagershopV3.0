import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ShopModeSelector from "./shop-mode-selector.component";
import { LocaleProvider } from "../../context/locale.context";
import { SHOP_MODE_STORAGE_KEY } from "../../hooks/useShopMode.hook";

const renderSelector = () =>
  render(
    <BrowserRouter>
      <LocaleProvider>
        <ShopModeSelector />
      </LocaleProvider>
    </BrowserRouter>
  );

describe("ShopModeSelector", () => {
  beforeEach(() => localStorage.clear());

  it("shows both choices on first visit", () => {
    renderSelector();
    expect(screen.getByText("Vào bản cổ điển")).toBeInTheDocument();
    expect(screen.getByText("Vào cửa hàng 3D")).toBeInTheDocument();
  });

  it("persists classic choice and hides the splash", () => {
    renderSelector();
    fireEvent.click(screen.getByText("Vào bản cổ điển"));
    expect(localStorage.getItem(SHOP_MODE_STORAGE_KEY)).toBe("classic");
    expect(screen.queryByText("Vào bản cổ điển")).not.toBeInTheDocument();
  });

  it("renders nothing when a mode was already chosen", () => {
    localStorage.setItem(SHOP_MODE_STORAGE_KEY, "classic");
    const { container } = renderSelector();
    expect(container).toBeEmptyDOMElement();
  });
});

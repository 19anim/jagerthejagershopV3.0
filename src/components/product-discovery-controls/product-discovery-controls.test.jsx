import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductDiscoveryControls from "./product-discovery-controls.component";
import { LocaleProvider } from "../../context/locale.context";
import { BrowserRouter } from "react-router-dom";

const renderControls = (filters, onFiltersChange = vi.fn()) => {
  render(
    <BrowserRouter>
      <LocaleProvider>
        <ProductDiscoveryControls
          categories={[{ _id: "cat-1", name: "Bottle" }]}
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      </LocaleProvider>
    </BrowserRouter>
  );
  return onFiltersChange;
};

describe("ProductDiscoveryControls", () => {
  it("emits search filter updates", () => {
    const onFiltersChange = renderControls({
      searchTerm: "",
      category: "ALL",
      inStockOnly: false,
      bestSellerOnly: false,
      sortBy: "newest",
    });
    fireEvent.change(screen.getByPlaceholderText("Tìm theo tên, danh mục hoặc dung tích"), {
      target: { value: "jager" },
    });
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ searchTerm: "jager" }));
  });
});

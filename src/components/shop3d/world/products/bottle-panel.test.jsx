import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import BottlePanel from "./bottle-panel";

const STRINGS = { stock: "Tồn kho", addToCart: "Thêm vào giỏ", soldOut: "Hết hàng" };
const t = (key) => STRINGS[key];

// The panel lives in a separate React root (drei <Html>), so it gets t and onAdd as props.
const renderPanel = (product, onAdd = vi.fn()) => {
  render(<BottlePanel product={product} t={t} onAdd={onAdd} />);
  return onAdd;
};

describe("BottlePanel", () => {
  it("shows name, price and stock and adds one to the cart", () => {
    const product = { _id: "p1", name: "Jagermeister Original 700ml", priceInInteger: 500000, stock: 3 };
    const add = renderPanel(product);
    expect(screen.getByText("Jagermeister Original 700ml")).toBeInTheDocument();
    expect(screen.getByText("500.000₫")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(add).toHaveBeenCalledWith(product);
  });

  it("disables the button when sold out", () => {
    const add = renderPanel({ _id: "p2", name: "Sold", priceInInteger: 1, stock: 0 });
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Hết hàng");
    fireEvent.click(button);
    expect(add).not.toHaveBeenCalled();
  });
});

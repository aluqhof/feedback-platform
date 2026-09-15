import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders with children text", () => {
    render(<Badge>NEW</Badge>);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-gray-100");
  });

  it("applies custom color as inline style", () => {
    render(<Badge color="#E11D48">Colored</Badge>);
    const badge = screen.getByText("Colored");
    expect(badge).toHaveStyle({ backgroundColor: "#E11D4820", color: "#E11D48" });
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows error message when error prop is provided", () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
  });

  it("shows helper text when provided", () => {
    render(<Input label="Email" helperText="Enter your work email" />);
    expect(screen.getByText("Enter your work email")).toBeInTheDocument();
  });

  it("does not show helper text when error is present", () => {
    render(
      <Input label="Email" error="Required" helperText="Enter your work email" />,
    );
    expect(screen.queryByText("Enter your work email")).not.toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("links error to input via aria-describedby", () => {
    render(<Input label="Email" error="Required" />);
    const input = screen.getByLabelText("Email");
    const errorId = input.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toHaveTextContent("Required");
  });
});

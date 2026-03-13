import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument();
  });

  it("accepts text input", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Name" />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Hello");
    expect(input).toHaveValue("Hello");
  });

  it("uses text type by default", () => {
    render(<Input aria-label="Field" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
  });

  it("applies error styling when error prop is true", () => {
    render(<Input aria-label="Email" error />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-danger");
  });

  it("applies default border when no error", () => {
    render(<Input aria-label="Email" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-border");
  });

  it("is disabled when disabled prop is set", () => {
    render(<Input aria-label="Field" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("shows placeholder text", () => {
    render(<Input placeholder="Enter name..." aria-label="Name" />);
    expect(screen.getByPlaceholderText("Enter name...")).toBeInTheDocument();
  });

  it("forwards className", () => {
    render(<Input aria-label="Field" className="custom-class" />);
    expect(screen.getByRole("textbox").className).toContain("custom-class");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<Input aria-label="Field" ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});

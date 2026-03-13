import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusSelector } from "./status-selector";

describe("StatusSelector", () => {
  it("renders all 5 status options", () => {
    render(<StatusSelector value="not_assessed" onChange={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "Compliant" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Partially Compliant" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Non-Compliant" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Not Applicable" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Not Assessed" })).toBeInTheDocument();
  });

  it("marks the current value as checked", () => {
    render(<StatusSelector value="compliant" onChange={vi.fn()} />);

    const compliantRadio = screen.getByRole("radio", { name: "Compliant" });
    expect(compliantRadio).toHaveAttribute("aria-checked", "true");

    const otherRadio = screen.getByRole("radio", { name: "Non-Compliant" });
    expect(otherRadio).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange when a different status is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<StatusSelector value="not_assessed" onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "Compliant" }));
    expect(onChange).toHaveBeenCalledWith("compliant");
  });

  it("navigates with arrow keys", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<StatusSelector value="compliant" onChange={onChange} />);

    // Focus the currently selected button
    const selected = screen.getByRole("radio", { name: "Compliant" });
    selected.focus();

    // Arrow right → partially_compliant
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("partially_compliant");
  });

  it("wraps around with arrow keys", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<StatusSelector value="not_assessed" onChange={onChange} />);

    const selected = screen.getByRole("radio", { name: "Not Assessed" });
    selected.focus();

    // Arrow right from last → wraps to first (compliant)
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("compliant");
  });

  it("disables all buttons when disabled prop is set", () => {
    render(<StatusSelector value="compliant" onChange={vi.fn()} disabled />);

    const buttons = screen.getAllByRole("radio");
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
  });

  it("has proper radiogroup role", () => {
    render(<StatusSelector value="compliant" onChange={vi.fn()} />);
    expect(screen.getByRole("radiogroup", { name: /compliance status/i })).toBeInTheDocument();
  });
});

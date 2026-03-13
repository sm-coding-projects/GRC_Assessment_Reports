import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders compliant badge with default label", () => {
    render(<Badge variant="compliant" />);
    expect(screen.getByText("Compliant")).toBeInTheDocument();
  });

  it("renders partial badge with default label", () => {
    render(<Badge variant="partial" />);
    expect(screen.getByText("Partially Compliant")).toBeInTheDocument();
  });

  it("renders non-compliant badge with default label", () => {
    render(<Badge variant="non-compliant" />);
    expect(screen.getByText("Non-Compliant")).toBeInTheDocument();
  });

  it("renders not-applicable badge with default label", () => {
    render(<Badge variant="not-applicable" />);
    expect(screen.getByText("Not Applicable")).toBeInTheDocument();
  });

  it("renders not-assessed badge with default label", () => {
    render(<Badge variant="not-assessed" />);
    expect(screen.getByText("Not Assessed")).toBeInTheDocument();
  });

  it("renders custom children instead of default label", () => {
    render(<Badge variant="compliant">Custom text</Badge>);
    expect(screen.getByText("Custom text")).toBeInTheDocument();
    expect(screen.queryByText("Compliant")).not.toBeInTheDocument();
  });

  it("includes a dot indicator", () => {
    const { container } = render(<Badge variant="compliant" />);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot).toBeTruthy();
    expect(dot?.className).toContain("rounded-full");
  });

  it("applies success color for compliant variant", () => {
    const { container } = render(<Badge variant="compliant" />);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot?.className).toContain("bg-success");
  });

  it("applies danger color for non-compliant variant", () => {
    const { container } = render(<Badge variant="non-compliant" />);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot?.className).toContain("bg-danger");
  });

  it("applies warning color for partial variant", () => {
    const { container } = render(<Badge variant="partial" />);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot?.className).toContain("bg-warning");
  });

  it("forwards className", () => {
    const { container } = render(<Badge variant="compliant" className="extra" />);
    const badge = container.querySelector(".extra");
    expect(badge).toBeTruthy();
  });
});

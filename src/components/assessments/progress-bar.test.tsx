import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./progress-bar";

const defaultProps = {
  compliant: 10,
  partiallyCompliant: 5,
  nonCompliant: 3,
  notApplicable: 2,
  notAssessed: 5,
  total: 25,
};

describe("ProgressBar", () => {
  it("renders the stacked bar with accessible label", () => {
    render(<ProgressBar {...defaultProps} />);

    const bar = screen.getByRole("img");
    expect(bar).toHaveAttribute(
      "aria-label",
      expect.stringContaining("10 compliant"),
    );
    expect(bar).toHaveAttribute(
      "aria-label",
      expect.stringContaining("5 partial"),
    );
  });

  it("shows count labels below the bar in full mode", () => {
    render(<ProgressBar {...defaultProps} />);

    expect(screen.getByText("10 Compliant")).toBeInTheDocument();
    expect(screen.getByText("5 Partial")).toBeInTheDocument();
    expect(screen.getByText("3 Non-Compliant")).toBeInTheDocument();
    expect(screen.getByText("2 N/A")).toBeInTheDocument();
    expect(screen.getByText("5 Unassessed")).toBeInTheDocument();
  });

  it("hides count labels in compact mode", () => {
    render(<ProgressBar {...defaultProps} compact />);

    expect(screen.queryByText("10 Compliant")).not.toBeInTheDocument();
  });

  it("returns null when total is 0", () => {
    const { container } = render(
      <ProgressBar
        compliant={0}
        partiallyCompliant={0}
        nonCompliant={0}
        notApplicable={0}
        notAssessed={0}
        total={0}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("hides segments with zero count", () => {
    const { container } = render(
      <ProgressBar
        compliant={5}
        partiallyCompliant={0}
        nonCompliant={0}
        notApplicable={0}
        notAssessed={5}
        total={10}
      />,
    );

    // Only compliant and unassessed labels shown
    expect(screen.getByText("5 Compliant")).toBeInTheDocument();
    expect(screen.getByText("5 Unassessed")).toBeInTheDocument();
    expect(screen.queryByText(/Partial/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Non-Compliant/)).not.toBeInTheDocument();
  });
});

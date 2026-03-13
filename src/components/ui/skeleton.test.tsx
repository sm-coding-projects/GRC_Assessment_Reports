import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders a div element", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeTruthy();
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("has aria-hidden attribute", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("applies pulse animation class", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("animate-pulse");
  });

  it("applies background styling", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-surface-inset");
  });

  it("forwards className", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-4");
    expect(el.className).toContain("w-32");
  });

  it("accepts standard div props", () => {
    const { container } = render(<Skeleton data-testid="skel" />);
    expect(container.querySelector("[data-testid='skel']")).toBeTruthy();
  });
});

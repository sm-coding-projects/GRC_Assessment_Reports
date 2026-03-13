import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Kbd } from "./kbd";

describe("Kbd", () => {
  it("renders single key with children", () => {
    render(<Kbd>K</Kbd>);
    expect(screen.getByText("K")).toBeInTheDocument();
    expect(screen.getByText("K").tagName).toBe("KBD");
  });

  it("renders multiple keys from keys prop", () => {
    render(<Kbd keys={["Cmd", "K"]} />);
    expect(screen.getByText("Cmd")).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();
  });

  it("renders each key as a kbd element", () => {
    render(<Kbd keys={["Ctrl", "S"]} />);
    const kbdElements = screen.getAllByText(/Ctrl|S/);
    kbdElements.forEach((el) => {
      expect(el.tagName).toBe("KBD");
    });
  });

  it("applies monospace font", () => {
    render(<Kbd>X</Kbd>);
    expect(screen.getByText("X").className).toContain("font-mono");
  });

  it("applies border styling", () => {
    render(<Kbd>Enter</Kbd>);
    expect(screen.getByText("Enter").className).toContain("border");
  });

  it("forwards className to single key", () => {
    render(<Kbd className="custom">A</Kbd>);
    expect(screen.getByText("A").className).toContain("custom");
  });
});

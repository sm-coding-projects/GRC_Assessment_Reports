import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
} from "./select";

function TestSelect() {
  return (
    <Select defaultValue="apple">
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectSeparator />
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("renders trigger with selected value", () => {
    render(<TestSelect />);
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("renders the trigger as a combobox", () => {
    render(<TestSelect />);
    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
  });

  it("renders trigger with placeholder when no default value", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Color">
          <SelectValue placeholder="Choose color" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="red">Red</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByText("Choose color")).toBeInTheDocument();
  });

  it("applies custom className to trigger", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Test" className="custom-class">
          <SelectValue placeholder="Test" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox").className).toContain("custom-class");
  });

  it("renders trigger with border styling", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Test">
          <SelectValue placeholder="Test" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.className).toContain("border-border");
    expect(trigger.className).toContain("h-9");
  });
});

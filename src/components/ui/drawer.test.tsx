import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "./drawer";

function TestDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button>Open drawer</button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit Template</DrawerTitle>
          <DrawerDescription>Make changes to your template.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <p>Drawer body content</p>
        </DrawerBody>
        <DrawerFooter>
          <button>Save</button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

describe("Drawer", () => {
  it("does not render content initially", () => {
    render(<TestDrawer />);
    expect(screen.queryByText("Edit Template")).not.toBeInTheDocument();
  });

  it("renders trigger button", () => {
    render(<TestDrawer />);
    expect(screen.getByRole("button", { name: "Open drawer" })).toBeInTheDocument();
  });

  it("opens drawer on trigger click", async () => {
    const user = userEvent.setup();
    render(<TestDrawer />);
    await user.click(screen.getByRole("button", { name: "Open drawer" }));
    expect(screen.getByText("Edit Template")).toBeInTheDocument();
    expect(screen.getByText("Make changes to your template.")).toBeInTheDocument();
    expect(screen.getByText("Drawer body content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("renders a close button inside the drawer", async () => {
    const user = userEvent.setup();
    render(<TestDrawer />);
    await user.click(screen.getByRole("button", { name: "Open drawer" }));
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("closes drawer when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<TestDrawer />);
    await user.click(screen.getByRole("button", { name: "Open drawer" }));
    expect(screen.getByText("Edit Template")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("Edit Template")).not.toBeInTheDocument();
  });

  it("applies width variant", async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent width="lg">
          <DrawerHeader>
            <DrawerTitle>Wide</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>,
    );
    await user.click(screen.getByText("Open"));
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("w-[640px]");
  });
});

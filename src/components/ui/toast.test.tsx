import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ToastProvider, useToast } from "./toast";

function ToastTrigger({
  message = "Hello",
  variant,
  duration,
}: {
  message?: string;
  variant?: "default" | "success" | "warning" | "danger";
  duration?: number;
}) {
  const { toast } = useToast();
  return (
    <button onClick={() => toast(message, { variant, duration })}>
      Show toast
    </button>
  );
}

describe("Toast", () => {
  it("shows a toast when triggered", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Saved successfully" />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));
    expect(screen.getByText("Saved successfully")).toBeInTheDocument();
  });

  it("auto-dismisses after duration", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ToastTrigger message="Temporary" duration={2000} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));
    expect(screen.getByText("Temporary")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(screen.queryByText("Temporary")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("can be dismissed manually", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Dismissable" duration={60000} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));
    expect(screen.getByText("Dismissable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("Dismissable")).not.toBeInTheDocument();
  });

  it("renders with success variant", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Done" variant="success" />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("success");
  });

  it("renders notification region", () => {
    render(
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>,
    );
    expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
  });

  it("throws when useToast is called outside provider", () => {
    function Bad() {
      useToast();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(
      "useToast must be used within a ToastProvider",
    );
  });
});

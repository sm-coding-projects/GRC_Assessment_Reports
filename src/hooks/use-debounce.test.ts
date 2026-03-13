import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedCallback } from "./use-debounce";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebouncedCallback", () => {
  it("does not call the callback immediately", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 800));

    act(() => {
      result.current();
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("calls the callback after the specified delay", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 800));

    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("resets the timer on subsequent calls within the delay", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 800));

    act(() => {
      result.current();
    });

    // Advance 600ms (not yet fired)
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(callback).not.toHaveBeenCalled();

    // Call again — should reset the timer
    act(() => {
      result.current();
    });

    // Advance another 600ms (total 1200ms from first call, 600ms from second)
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(callback).not.toHaveBeenCalled();

    // Advance remaining 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("only fires once when called rapidly", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 800));

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current();
      }
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("cleans up the timer on unmount", () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 800));

    act(() => {
      result.current();
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("uses the latest callback reference", () => {
    let count = 0;
    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 800),
      { initialProps: { cb: () => { count = 1; } } },
    );

    // Update callback
    rerender({ cb: () => { count = 2; } });

    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(count).toBe(2);
  });
});

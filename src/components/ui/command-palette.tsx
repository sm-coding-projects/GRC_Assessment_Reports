"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Search,
  LayoutDashboard,
  FileStack,
  ClipboardCheck,
  Plus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  group: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used within a CommandPaletteProvider");
  }
  return ctx;
}

function CommandPaletteProvider({ children }: { children: ReactNode }): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const STATIC_ITEMS: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        icon: LayoutDashboard,
        group: "Navigation",
        action: () => {
          router.push("/");
          close();
        },
        keywords: ["home", "overview"],
      },
      {
        id: "nav-templates",
        label: "Go to Templates",
        icon: FileStack,
        group: "Navigation",
        action: () => {
          router.push("/templates");
          close();
        },
        keywords: ["checklist", "framework"],
      },
      {
        id: "nav-assessments",
        label: "Go to Assessments",
        icon: ClipboardCheck,
        group: "Navigation",
        action: () => {
          router.push("/assessments");
          close();
        },
        keywords: ["evaluate", "compliance"],
      },
      {
        id: "nav-settings",
        label: "Go to Settings",
        icon: Settings,
        group: "Navigation",
        action: () => {
          router.push("/settings");
          close();
        },
        keywords: ["preferences", "account"],
      },
      {
        id: "action-new-template",
        label: "Create new template",
        icon: Plus,
        group: "Actions",
        action: () => {
          router.push("/templates/new");
          close();
        },
        keywords: ["add", "build", "checklist"],
      },
      {
        id: "action-new-assessment",
        label: "Start new assessment",
        icon: Plus,
        group: "Actions",
        action: () => {
          router.push("/assessments/new");
          close();
        },
        keywords: ["begin", "evaluate", "audit"],
      },
    ],
    [router, close],
  );

  return (
    <CommandPaletteContext.Provider value={{ open, close, isOpen }}>
      {children}
      <CommandPaletteDialog
        isOpen={isOpen}
        onClose={close}
        items={STATIC_ITEMS}
      />
    </CommandPaletteContext.Provider>
  );
}

interface CommandPaletteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
}

function CommandPaletteDialog({
  isOpen,
  onClose,
  items,
}: CommandPaletteDialogProps): ReactNode {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset on open (derived state pattern)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  // Focus input after open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.keywords?.some((kw) => kw.includes(q)),
    );
  }, [items, query]);

  // Group filtered items
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.group]) {
        groups[item.group] = [];
      }
      groups[item.group].push(item);
    }
    return groups;
  }, [filtered]);

  // Reset index when results change (derived state pattern)
  const [prevFilteredLength, setPrevFilteredLength] = useState(filtered.length);
  if (prevFilteredLength !== filtered.length) {
    setPrevFilteredLength(filtered.length);
    setSelectedIndex(0);
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filtered.length);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (filtered[selectedIndex]) {
            filtered[selectedIndex].action();
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          onClose();
          break;
        }
      }
    },
    [filtered, selectedIndex, onClose],
  );

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.querySelector(`[data-index="${selectedIndex}"]`);
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-[20%] z-[60] w-full max-w-[520px] -translate-x-1/2",
            "rounded-md border border-border bg-surface shadow-xl",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "duration-150",
          )}
          onKeyDown={handleKeyDown}
        >
          <DialogPrimitive.Title className="sr-only">
            Command palette
          </DialogPrimitive.Title>

          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border-muted px-4 py-3">
            <Search size={16} className="shrink-0 text-ink-subtle" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands..."
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-subtle outline-none"
              aria-label="Search commands"
            />
            <kbd className="hidden sm:inline-flex h-5 items-center justify-center rounded-sm border border-border bg-surface-alt px-1.5 font-mono text-[11px] text-ink-muted shadow-[0_1px_0_1px_rgba(0,0,0,0.04)]">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            className="max-h-[320px] overflow-y-auto p-2"
            role="listbox"
          >
            {filtered.length === 0 && (
              <div className="py-8 text-center text-sm text-ink-muted">
                No results found.
              </div>
            )}

            {Object.entries(grouped).map(([group, groupItems]) => {
              const startIndex = filtered.indexOf(groupItems[0]);

              return (
                <div key={group} className="mb-1 last:mb-0">
                  <div className="px-2 py-1.5 text-xs font-medium uppercase tracking-label text-ink-subtle">
                    {group}
                  </div>
                  {groupItems.map((item, i) => {
                    const globalIndex = startIndex + i;
                    const Icon = item.icon;
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        data-index={globalIndex}
                        role="option"
                        aria-selected={isSelected}
                        className={cn(
                          "flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-left transition-colors",
                          isSelected
                            ? "bg-accent-subtle text-accent"
                            : "text-ink hover:bg-surface-alt",
                        )}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <Icon size={16} className="shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.description && (
                          <span className="text-xs text-ink-subtle">
                            {item.description}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { CommandPaletteProvider, useCommandPalette };

import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ControlSelector, controlKey } from "./control-selector";
import type { Framework, FrameworkDomain } from "@/types/framework";

const mockFramework: Framework = {
  id: "iso27001",
  name: "Test Framework",
  description: "A test framework",
  version: "1.0",
  domains: [
    {
      id: "d1",
      name: "Domain 1 — Access Control",
      controls: [
        {
          id: "1.1",
          name: "User Authentication",
          description: "Verify user identity before granting access.",
          domain: "Domain 1 — Access Control",
          framework: "iso27001",
        },
        {
          id: "1.2",
          name: "Password Policy",
          description: "Enforce strong password requirements.",
          domain: "Domain 1 — Access Control",
          framework: "iso27001",
        },
        {
          id: "1.3",
          name: "Multi-Factor Authentication",
          description: "Require MFA for privileged access.",
          domain: "Domain 1 — Access Control",
          framework: "iso27001",
        },
      ],
    },
    {
      id: "d2",
      name: "Domain 2 — Encryption",
      controls: [
        {
          id: "2.1",
          name: "Data at Rest",
          description: "Encrypt all sensitive data at rest using AES-256.",
          domain: "Domain 2 — Encryption",
          framework: "iso27001",
        },
        {
          id: "2.2",
          name: "Data in Transit",
          description: "Use TLS 1.2+ for all data in transit.",
          domain: "Domain 2 — Encryption",
          framework: "iso27001",
        },
      ],
    },
  ],
};

function renderSelector(
  overrides: Partial<{
    selectedKeys: Set<string>;
    onToggle: (key: string) => void;
    onToggleDomain: (frameworkId: string, domain: FrameworkDomain, selectAll: boolean) => void;
  }> = {},
) {
  const onToggle = overrides.onToggle ?? vi.fn();
  const onToggleDomain = overrides.onToggleDomain ?? vi.fn();
  const selectedKeys = overrides.selectedKeys ?? new Set<string>();

  const result = render(
    <ControlSelector
      framework={mockFramework}
      selectedKeys={selectedKeys}
      onToggle={onToggle}
      onToggleDomain={onToggleDomain}
    />,
  );

  return { ...result, onToggle, onToggleDomain };
}

describe("ControlSelector", () => {
  it("renders the framework name and selection count", () => {
    renderSelector();
    expect(screen.getByText("Test Framework")).toBeInTheDocument();
    expect(screen.getByText("0 of 5 controls selected")).toBeInTheDocument();
  });

  it("renders all domains", () => {
    renderSelector();
    expect(screen.getByText("Domain 1 — Access Control")).toBeInTheDocument();
    expect(screen.getByText("Domain 2 — Encryption")).toBeInTheDocument();
  });

  it("renders all controls within domains", () => {
    renderSelector();
    expect(screen.getByText("User Authentication")).toBeInTheDocument();
    expect(screen.getByText("Password Policy")).toBeInTheDocument();
    expect(screen.getByText("Multi-Factor Authentication")).toBeInTheDocument();
    expect(screen.getByText("Data at Rest")).toBeInTheDocument();
    expect(screen.getByText("Data in Transit")).toBeInTheDocument();
  });

  it("shows control IDs in monospace", () => {
    renderSelector();
    const controlId = screen.getByText("1.1");
    expect(controlId).toHaveClass("font-mono");
  });

  it("shows control descriptions", () => {
    renderSelector();
    expect(screen.getByText(/Verify user identity before granting access/)).toBeInTheDocument();
  });

  describe("search filtering", () => {
    it("filters controls by name", async () => {
      const user = userEvent.setup();
      renderSelector();

      const searchInput = screen.getByPlaceholderText("Filter by ID, name, or description...");
      await user.type(searchInput, "Password");

      expect(screen.getByText("Password Policy")).toBeInTheDocument();
      expect(screen.queryByText("User Authentication")).not.toBeInTheDocument();
      expect(screen.queryByText("Data at Rest")).not.toBeInTheDocument();
    });

    it("filters controls by ID", async () => {
      const user = userEvent.setup();
      renderSelector();

      const searchInput = screen.getByPlaceholderText("Filter by ID, name, or description...");
      await user.type(searchInput, "2.1");

      expect(screen.getByText("Data at Rest")).toBeInTheDocument();
      expect(screen.queryByText("User Authentication")).not.toBeInTheDocument();
    });

    it("filters controls by description", async () => {
      const user = userEvent.setup();
      renderSelector();

      const searchInput = screen.getByPlaceholderText("Filter by ID, name, or description...");
      await user.type(searchInput, "AES-256");

      expect(screen.getByText("Data at Rest")).toBeInTheDocument();
      expect(screen.queryByText("Password Policy")).not.toBeInTheDocument();
    });

    it("is case-insensitive", async () => {
      const user = userEvent.setup();
      renderSelector();

      const searchInput = screen.getByPlaceholderText("Filter by ID, name, or description...");
      await user.type(searchInput, "password");

      expect(screen.getByText("Password Policy")).toBeInTheDocument();
    });

    it("hides domains with no matching controls", async () => {
      const user = userEvent.setup();
      renderSelector();

      const searchInput = screen.getByPlaceholderText("Filter by ID, name, or description...");
      await user.type(searchInput, "AES");

      expect(screen.queryByText("Domain 1 — Access Control")).not.toBeInTheDocument();
      expect(screen.getByText("Domain 2 — Encryption")).toBeInTheDocument();
    });

    it("shows empty state when no controls match", async () => {
      const user = userEvent.setup();
      renderSelector();

      const searchInput = screen.getByPlaceholderText("Filter by ID, name, or description...");
      await user.type(searchInput, "zzz-no-match");

      expect(screen.getByText("No controls match your search.")).toBeInTheDocument();
    });
  });

  describe("individual control toggle", () => {
    it("calls onToggle with the control key when clicking a checkbox", async () => {
      const user = userEvent.setup();
      const { onToggle } = renderSelector();

      const checkboxes = screen.getAllByRole("checkbox");
      // First two are domain-level, then controls: 1.1, 1.2, 1.3, 2.1, 2.2
      // Domain 1 checkbox is index 0, controls are index 1, 2, 3
      // Domain 2 checkbox is index 4, controls are index 5, 6
      // Actually the structure interleaves: domain checkbox, then control checkboxes
      // Let's click by label instead

      const controlLabel = screen.getByText("User Authentication").closest("label");
      expect(controlLabel).toBeTruthy();
      await user.click(controlLabel!);

      expect(onToggle).toHaveBeenCalledWith("iso27001::1.1");
    });

    it("shows checked state for selected controls", () => {
      const selectedKeys = new Set(["iso27001::1.1", "iso27001::2.2"]);
      renderSelector({ selectedKeys });

      expect(screen.getByText("2 of 5 controls selected")).toBeInTheDocument();
    });
  });

  describe("select all / deselect all per domain", () => {
    it("calls onToggleDomain with selectAll=true when clicking Select all", async () => {
      const user = userEvent.setup();
      const { onToggleDomain } = renderSelector();

      const selectAllButtons = screen.getAllByText("Select all");
      await user.click(selectAllButtons[0]);

      expect(onToggleDomain).toHaveBeenCalledWith(
        "iso27001",
        mockFramework.domains[0],
        true,
      );
    });

    it("shows Deselect all when all controls in domain are selected", async () => {
      const user = userEvent.setup();
      const selectedKeys = new Set([
        "iso27001::1.1",
        "iso27001::1.2",
        "iso27001::1.3",
      ]);
      const { onToggleDomain } = renderSelector({ selectedKeys });

      const deselectBtn = screen.getByText("Deselect all");
      await user.click(deselectBtn);

      expect(onToggleDomain).toHaveBeenCalledWith(
        "iso27001",
        mockFramework.domains[0],
        false,
      );
    });

    it("calls onToggleDomain when clicking domain checkbox", async () => {
      const user = userEvent.setup();
      const { onToggleDomain } = renderSelector();

      const domainCheckbox = screen.getByLabelText("Select all controls in Domain 1 — Access Control");
      await user.click(domainCheckbox);

      expect(onToggleDomain).toHaveBeenCalledWith(
        "iso27001",
        mockFramework.domains[0],
        true,
      );
    });

    it("shows domain selection count", () => {
      const selectedKeys = new Set(["iso27001::1.1", "iso27001::1.3"]);
      renderSelector({ selectedKeys });

      expect(screen.getByText("2/3")).toBeInTheDocument();
    });
  });

  describe("domain collapse", () => {
    it("collapses domain controls when clicking chevron", async () => {
      const user = userEvent.setup();
      renderSelector();

      expect(screen.getByText("User Authentication")).toBeInTheDocument();

      const collapseBtn = screen.getByLabelText("Collapse Domain 1 — Access Control");
      await user.click(collapseBtn);

      expect(screen.queryByText("User Authentication")).not.toBeInTheDocument();
      expect(screen.getByText("Domain 1 — Access Control")).toBeInTheDocument();
    });

    it("expands domain controls when clicking chevron again", async () => {
      const user = userEvent.setup();
      renderSelector();

      const collapseBtn = screen.getByLabelText("Collapse Domain 1 — Access Control");
      await user.click(collapseBtn);
      expect(screen.queryByText("User Authentication")).not.toBeInTheDocument();

      const expandBtn = screen.getByLabelText("Expand Domain 1 — Access Control");
      await user.click(expandBtn);
      expect(screen.getByText("User Authentication")).toBeInTheDocument();
    });
  });

  describe("controlKey utility", () => {
    it("creates composite key from framework and control ID", () => {
      expect(controlKey("iso27001", "5.1")).toBe("iso27001::5.1");
      expect(controlKey("soc2", "CC1.1")).toBe("soc2::CC1.1");
    });
  });
});

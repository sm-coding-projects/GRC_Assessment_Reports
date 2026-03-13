import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumbs } from "./breadcrumbs";

describe("Breadcrumbs", () => {
  it("renders all items", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Templates", href: "/templates" },
          { label: "ISO 27001" },
        ]}
      />,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Templates")).toBeInTheDocument();
    expect(screen.getByText("ISO 27001")).toBeInTheDocument();
  });

  it("renders nav with breadcrumb aria-label", () => {
    render(
      <Breadcrumbs items={[{ label: "Home", href: "/" }]} />,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("marks last item as current page", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Current" },
        ]}
      />,
    );
    expect(screen.getByText("Current")).toHaveAttribute("aria-current", "page");
  });

  it("renders links for non-last items with href", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Templates", href: "/templates" },
          { label: "Detail" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Templates" })).toHaveAttribute("href", "/templates");
  });

  it("does not render last item as a link", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Last" },
        ]}
      />,
    );
    expect(screen.queryByRole("link", { name: "Last" })).not.toBeInTheDocument();
  });

  it("renders separators between items", () => {
    const { container } = render(
      <Breadcrumbs
        items={[
          { label: "A", href: "/a" },
          { label: "B", href: "/b" },
          { label: "C" },
        ]}
      />,
    );
    const separators = container.querySelectorAll("[aria-hidden='true']");
    expect(separators).toHaveLength(2);
  });

  it("uses custom renderLink when provided", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "End" },
        ]}
        renderLink={({ href, children }) => (
          <a href={href} data-testid="custom-link">
            {children}
          </a>
        )}
      />,
    );
    expect(screen.getByTestId("custom-link")).toBeInTheDocument();
  });
});

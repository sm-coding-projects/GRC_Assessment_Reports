import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table";

function TestTable({ onSort }: { onSort?: () => void } = {}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead sortDirection="asc" onSort={onSort}>
            Status
          </TableHead>
          <TableHead sortDirection={null} onSort={onSort}>
            Date
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>ISO 27001</TableCell>
          <TableCell>Active</TableCell>
          <TableCell>2025-01-01</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>SOC 2</TableCell>
          <TableCell>Draft</TableCell>
          <TableCell>2025-02-01</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe("Table", () => {
  it("renders table with headers and rows", () => {
    render(<TestTable />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("ISO 27001")).toBeInTheDocument();
    expect(screen.getByText("SOC 2")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<TestTable />);
    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(3);
  });

  it("renders data rows", () => {
    render(<TestTable />);
    const rows = screen.getAllByRole("row");
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3);
  });

  it("applies alternating row styles on body", () => {
    render(<TestTable />);
    const tbody = screen.getAllByRole("row")[1].parentElement;
    expect(tbody?.className).toContain("nth-child");
  });

  it("applies sticky header styling", () => {
    render(<TestTable />);
    const thead = screen.getAllByRole("columnheader")[0].parentElement?.parentElement;
    expect(thead?.className).toContain("sticky");
  });

  it("calls onSort when sortable header is clicked", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<TestTable onSort={onSort} />);
    await user.click(screen.getByText("Status"));
    expect(onSort).toHaveBeenCalledOnce();
  });

  it("renders sort icons for sortable columns", () => {
    render(<TestTable onSort={() => {}} />);
    // Status has asc direction, Date has null direction but is sortable
    // Both should have sort indicators
    const statusHeader = screen.getByText("Status").closest("th");
    const dateHeader = screen.getByText("Date").closest("th");
    expect(statusHeader?.querySelector("svg")).toBeTruthy();
    expect(dateHeader?.querySelector("svg")).toBeTruthy();
  });

  it("does not render sort icon for non-sortable columns", () => {
    render(<TestTable />);
    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader?.querySelector("svg")).toBeFalsy();
  });
});

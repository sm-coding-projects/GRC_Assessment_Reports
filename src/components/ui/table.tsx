import { forwardRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SortDirection = "asc" | "desc" | null;

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm font-sans", className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("sticky top-0 z-10 bg-surface border-b border-border", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&>tr:nth-child(even)]:bg-surface-alt", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border-muted transition-colors",
      "hover:bg-surface-alt/50",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortDirection?: SortDirection;
  onSort?: () => void;
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortDirection, onSort, children, ...props }, ref) => {
    const sortIcon =
      sortDirection === "asc" ? (
        <ArrowUp className="ml-1 h-3.5 w-3.5" />
      ) : sortDirection === "desc" ? (
        <ArrowDown className="ml-1 h-3.5 w-3.5" />
      ) : onSort ? (
        <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-ink-subtle" />
      ) : null;

    return (
      <th
        ref={ref}
        className={cn(
          "h-10 px-3 text-left align-middle text-xs font-medium text-ink-muted",
          "tracking-label uppercase",
          onSort && "cursor-pointer select-none hover:text-ink",
          className,
        )}
        onClick={onSort}
        {...props}
      >
        <span className="inline-flex items-center">
          {children}
          {sortIcon}
        </span>
      </th>
    );
  },
);
TableHead.displayName = "TableHead";

const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-3 py-2.5 align-middle text-sm text-ink", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  type SortDirection,
};

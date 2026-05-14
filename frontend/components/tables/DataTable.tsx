"use client";

import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  rows,
  isLoading,
  emptyMessage = "No data found.",
}: {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-semibold text-zinc-700">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.id ?? idx}
              className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-4 py-3 text-zinc-800", col.className)}
                >
                  {col.render ? col.render(row) : String((row as never)[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

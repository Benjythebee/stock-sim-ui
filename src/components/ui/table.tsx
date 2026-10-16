import type { ReactNode } from "react";

/** The single centered row a table shows while it has no data. */
export const TableEmptyRow = ({colSpan, children}: {colSpan: number, children: ReactNode}) => (
    <tr><td colSpan={colSpan} className="text-center opacity-60">{children}</td></tr>
);

import React from "react";

import { flexRender } from "@tanstack/react-table";

import { TableRowTanstackProps } from "@interfaces/components";
import { cn } from "@utilities";

export const TableRowTanstack = <TData,>({ row, className }: TableRowTanstackProps<TData>) => {
	const trStyle = cn("hover:bg-gray-1300", className);

	return (
		<tr className={trStyle}>
			{row.getVisibleCells().map((cell) => (
				<td
					className="py-0.5 text-white first:pl-4 last:pr-4"
					key={cell.id}
					style={{
						width: cell.column.getSize(),
					}}
				>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</td>
			))}
		</tr>
	);
};

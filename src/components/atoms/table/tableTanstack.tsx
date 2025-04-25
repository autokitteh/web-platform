import React from "react";

import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

import { TableTanstackProps } from "@interfaces/components";
import { cn } from "@src/utilities";

import { TableRowTanstack, THeadTanstack } from "@components/atoms/table";

export const TableTanstack = <TData,>({ data, columns, className }: TableTanstackProps<TData>) => {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		defaultColumn: {
			size: 200,
			minSize: 40,
		},
	});

	return (
		<div className={cn("overflow-x-auto", className)}>
			<table className="w-full overflow-hidden rounded-t-14">
				<THeadTanstack headerGroups={table.getHeaderGroups()} />
				<tbody className="border-b-2 border-gray-1050">
					{table.getRowModel().rows.map((row) => (
						<TableRowTanstack key={row.id} row={row} />
					))}
				</tbody>
			</table>
		</div>
	);
};

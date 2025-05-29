import React, { useRef, useEffect, useState, memo } from "react";

import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import { TableTanstackProps } from "@interfaces/components";
import { cn } from "@src/utilities";

import { TableRowTanstack, THeadTanstack } from "@components/atoms/table";

const MemoizedRow = memo(({ row }: { row: any }) => {
	return <TableRowTanstack row={row} />;
});

MemoizedRow.displayName = "MemoizedRow";

export const TableTanstack = <TData,>({ data, columns, className }: TableTanstackProps<TData>) => {
	const [tableWidth, setTableWidth] = useState(0);
	const tableRef = useRef<HTMLDivElement>(null);
	const tbodyRef = useRef<HTMLTableSectionElement>(null);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		defaultColumn: {
			size: 200,
			minSize: 40,
		},
	});

	useEffect(() => {
		if (!tableRef.current) return;

		const updateWidth = () => {
			if (tableRef.current) {
				setTableWidth(tableRef.current.offsetWidth);
			}
		};

		updateWidth();

		const resizeObserver = new ResizeObserver(updateWidth);
		resizeObserver.observe(tableRef.current);

		window.addEventListener("resize", updateWidth);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", updateWidth);
		};
	}, []);

	const rowVirtualizer = useVirtualizer({
		count: table.getRowModel().rows.length,
		getScrollElement: () => tableRef.current,
		estimateSize: () => 40,
		overscan: 10,
	});

	const virtualRows = rowVirtualizer.getVirtualItems();
	const totalSize = rowVirtualizer.getTotalSize();

	const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
	const paddingBottom = virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0;

	return (
		<div className={cn("scrollbar relative max-h-500 overflow-y-auto overflow-x-hidden", className)} ref={tableRef}>
			<table className="w-full overflow-hidden rounded-t-14" style={{ width: tableWidth }}>
				<THeadTanstack headerGroups={table.getHeaderGroups()} />
				<tbody className="border-b-2 border-gray-1050" ref={tbodyRef}>
					{paddingTop > 0 ? (
						<tr style={{ height: `${paddingTop}px` }}>
							<td colSpan={columns.length} />
						</tr>
					) : null}

					{virtualRows.map((virtualRow) => {
						const row = table.getRowModel().rows[virtualRow.index];
						return <MemoizedRow key={row.id} row={row} />;
					})}

					{paddingBottom > 0 ? (
						<tr style={{ height: `${paddingBottom}px` }}>
							<td colSpan={columns.length} />
						</tr>
					) : null}
				</tbody>
			</table>
		</div>
	);
};

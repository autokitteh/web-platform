import React, { useRef, useEffect, useState, memo } from "react";

import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	ColumnFiltersState,
	getFacetedUniqueValues,
	RowSelectionState,
	createColumnHelper,
	RowData,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import { TableActions } from "./tableActions";
import { TableTanstackProps } from "@interfaces/components";
import { cn } from "@src/utilities";

import { Checkbox } from "@components/atoms/checkbox";
import { TableRowTanstack, THeadTanstack } from "@components/atoms/table";

const columnHelper = createColumnHelper<any>();

const MemoizedRow = memo(({ row, onRowSelect }: { onRowSelect: (row: any) => void; row: any }) => {
	return <TableRowTanstack onRowSelect={onRowSelect} row={row} />;
});

MemoizedRow.displayName = "MemoizedRow";

export const TableTanstack = <TData extends RowData>({
	data,
	columns,
	className,
	actionConfig,
}: TableTanstackProps<TData>) => {
	const [tableWidth, setTableWidth] = useState(0);
	const tableRef = useRef<HTMLDivElement>(null);
	const tbodyRef = useRef<HTMLTableSectionElement>(null);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const selectionColumn = columnHelper.display({
		id: "select",
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				className="p-0"
				isLoading={false}
				label=" "
				onChange={row.getToggleSelectedHandler()}
			/>
		),
		size: 30,
	});

	const hasActionConfig = actionConfig && actionConfig.length > 0;

	const table = useReactTable({
		data,
		columns: hasActionConfig ? [selectionColumn, ...columns] : columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		state: {
			columnFilters,
			rowSelection,
		},
		onColumnFiltersChange: setColumnFilters,
		onRowSelectionChange: setRowSelection,
		enableRowSelection: hasActionConfig,
		defaultColumn: {
			size: 200,
			minSize: 30,
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

	const handleRowSelect = (row: any) => {
		row.toggleSelected();
	};

	const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);

	return (
		<div>
			{actionConfig ? (
				<TableActions actions={actionConfig} onReset={() => setRowSelection({})} selectedRows={selectedRows} />
			) : null}

			<div
				className={cn("scrollbar relative max-h-500 overflow-y-auto overflow-x-hidden", className)}
				ref={tableRef}
			>
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
							return <MemoizedRow key={row.id} onRowSelect={handleRowSelect} row={row} />;
						})}

						{paddingBottom > 0 ? (
							<tr style={{ height: `${paddingBottom}px` }}>
								<td colSpan={columns.length} />
							</tr>
						) : null}
					</tbody>
				</table>
			</div>
		</div>
	);
};

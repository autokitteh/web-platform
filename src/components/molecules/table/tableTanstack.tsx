import React, { useRef, useState, memo, useMemo } from "react";

import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	ColumnFiltersState,
	getFacetedUniqueValues,
	RowSelectionState,
	createColumnHelper,
	RowData,
	getSortedRowModel,
	Row,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import { TableActionsTanstack } from "./tableActions";
import { TableTanstackProps } from "@interfaces/components";
import { cn } from "@src/utilities";

import { Checkbox } from "@components/atoms/checkbox";
import { TableRowTanstack, THeadTanstack } from "@components/molecules/table";

const columnHelper = createColumnHelper<any>();

const MemoizedRow = memo(({ row, onRowSelect }: { onRowSelect: (row: Row<unknown>) => void; row: any }) => {
	return <TableRowTanstack onRowSelect={onRowSelect} row={row} />;
});

MemoizedRow.displayName = "MemoizedRow";

export const TableTanstack = <TData extends RowData>({
	data,
	columns,
	className,
	actionConfig,
	enableColumnResizing = false,
	initialSortId,
}: TableTanstackProps<TData>) => {
	const tableRef = useRef<HTMLDivElement>(null);
	const tbodyRef = useRef<HTMLTableSectionElement>(null);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [sorting, setSorting] = useState(initialSortId ? [{ id: initialSortId, desc: false }] : []);

	const selectionColumn = columnHelper.display({
		id: "rowSelection",
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

	const hasActionConfig = useMemo(() => {
		return actionConfig && actionConfig.length > 0;
	}, [actionConfig]);

	const table = useReactTable({
		data,
		columns: hasActionConfig ? [selectionColumn, ...columns] : columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getSortedRowModel: getSortedRowModel(),
		enableColumnResizing,
		columnResizeMode: "onChange",
		state: {
			columnFilters,
			rowSelection,
			sorting,
		},
		onColumnFiltersChange: setColumnFilters,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		enableRowSelection: hasActionConfig,
		defaultColumn: {
			size: 150,
			minSize: 30,
			maxSize: 200,
			enableSorting: false,
		},
	});

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

	const handleRowSelect = (row: Row<unknown>) => {
		row.toggleSelected();
	};

	const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);

	return (
		<div>
			{actionConfig ? (
				<TableActionsTanstack
					actions={actionConfig}
					onReset={() => {
						setRowSelection({});
					}}
					selectedRows={selectedRows}
				/>
			) : null}

			<div
				className={cn("scrollbar relative max-h-500 overflow-y-auto overflow-x-hidden", className)}
				ref={tableRef}
			>
				<table className="w-full">
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

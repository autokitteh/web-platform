import { KeyboardEvent, MouseEvent } from "react";

import { Column, Header, HeaderGroup, Row, RowData } from "@tanstack/react-table";

import { ColorSchemes } from "@src/types";

export interface TableProps {
	children?: React.ReactNode;
	className?: string;
	onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
	style?: React.CSSProperties;
	title?: string;
	innerDivClassName?: string;
	textWrapperClassName?: string;
}

export interface TableVariantContextType {
	variant: ColorSchemes;
}

export interface TableAction<TData extends RowData> {
	label: string;
	onClick: (rows: TData[]) => void;
}

export interface TableActionsProps<TData extends RowData> {
	selectedRows: TData[];
	actions: TableAction<TData>[];
	onReset: () => void;
}

export interface TableTanstackProps<TData extends RowData> {
	data: TData[];
	columns: any[];
	className?: string;
	actionConfig?: TableAction<TData>[];
	enableColumnResizing?: boolean;
	initialSortId?: string;
}

export interface TableRowTanstackProps<TData> {
	row: Row<TData>;
	className?: string;
	onRowSelect: (row: Row<TData>) => void;
}

export interface THeadTanstackProps<TData> {
	headerGroups: HeaderGroup<TData>[];
	className?: string;
}

export interface ThTanstackProps<TData> {
	header: Header<TData, unknown>;
	className?: string;
}

export interface FilterVariantColumnTable {
	filterVariant?: "select" | "search";
}

export interface FilterTableTanstackProps<TData> {
	column: Column<TData, unknown>;
}

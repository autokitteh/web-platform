import { KeyboardEvent, MouseEvent } from "react";

import { ColumnDef, Header, HeaderGroup, Row } from "@tanstack/react-table";

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

export interface TableTanstackProps<TData> {
	data: TData[];
	columns: ColumnDef<TData>[];
	className?: string;
}

export interface TableRowTanstackProps<TData> {
	row: Row<TData>;
	className?: string;
}

export interface THeadTanstackProps<TData> {
	headerGroups: HeaderGroup<TData>[];
	className?: string;
}

export interface ThTanstackProps<TData> {
	header: Header<TData, unknown>;
	className?: string;
}

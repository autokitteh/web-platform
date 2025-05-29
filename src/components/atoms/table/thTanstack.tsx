import React from "react";

import { flexRender } from "@tanstack/react-table";

import { FilterVariantColumnTable, ThTanstackProps } from "@interfaces/components";
import { cn } from "@src/utilities";

import { FilterTableTanstack } from "@components/atoms/table";

export const ThTanstack = <TData,>({ header, className }: ThTanstackProps<TData>) => {
	const { filterVariant } = (header.column.columnDef.meta || {}) as FilterVariantColumnTable;

	return (
		<th
			className={cn("py-0.5 pr-4 font-normal first:pl-4", { "align-top": filterVariant }, className)}
			key={header.id}
			style={{
				width: header.getSize(),
			}}
		>
			{flexRender(header.column.columnDef.header, header.getContext())}
			{filterVariant ? <FilterTableTanstack column={header.column} /> : null}
		</th>
	);
};

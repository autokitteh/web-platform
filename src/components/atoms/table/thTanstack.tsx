import React from "react";

import { flexRender } from "@tanstack/react-table";

import { FilterVariantColumnTable, ThTanstackProps } from "@interfaces/components";
import { cn } from "@src/utilities";

import { FilterTableTanstack } from "@components/atoms/table";

export const ThTanstack = <TData,>({ header, className }: ThTanstackProps<TData>) => {
	const { filterVariant } = (header.column.columnDef.meta || {}) as FilterVariantColumnTable;

	return (
		<th
			className={cn("py-0.5 font-normal first:pl-4 last:pr-4", className)}
			key={header.id}
			style={{
				width: header.getSize(),
			}}
		>
			<div className="flex flex-col gap-1">
				{flexRender(header.column.columnDef.header, header.getContext())}
				{header.column.getCanFilter() && filterVariant ? (
					<div className="mt-1">
						<FilterTableTanstack column={header.column} />
					</div>
				) : null}
			</div>
		</th>
	);
};

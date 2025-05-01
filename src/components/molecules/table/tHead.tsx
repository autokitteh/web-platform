import React, { useMemo } from "react";

import { ThTanstack } from "./tH";
import { FilterVariantColumnTable, THeadTanstackProps } from "@interfaces/components";
import { cn } from "@utilities";

export const THeadTanstack = <TData,>({ headerGroups, className }: THeadTanstackProps<TData>) => {
	const hasAnyFilter = useMemo(
		() =>
			headerGroups.some((headerGroup) =>
				headerGroup.headers.some(
					(header) => (header.column.columnDef.meta as FilterVariantColumnTable)?.filterVariant
				)
			),
		[headerGroups]
	);

	const headStyle = cn(
		"sticky top-0 z-10 h-9.5 border-b-2 border-gray-1050 bg-gray-1250 text-left text-gray-500",
		{
			"align-top leading-7": hasAnyFilter,
		},
		className
	);

	return (
		<thead className={headStyle}>
			{headerGroups.map((headerGroup) => (
				<tr key={headerGroup.id}>
					{headerGroup.headers.map((header) => (
						<ThTanstack header={header} key={header.id} />
					))}
				</tr>
			))}
		</thead>
	);
};

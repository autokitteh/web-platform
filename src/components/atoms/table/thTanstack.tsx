import React from "react";

import { flexRender } from "@tanstack/react-table";

import { ThTanstackProps } from "@interfaces/components";
import { cn } from "@src/utilities";

export const ThTanstack = <TData,>({ header, className }: ThTanstackProps<TData>) => {
	return (
		<th
			className={cn("py-0.5 font-normal first:pl-4 last:pr-4", className)}
			key={header.id}
			style={{
				width: header.getSize(),
			}}
		>
			{flexRender(header.column.columnDef.header, header.getContext())}
		</th>
	);
};

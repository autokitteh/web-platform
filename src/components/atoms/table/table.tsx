import React from "react";

import { TableProps } from "@interfaces/components";
import { ColorSchemes } from "@src/types";
import { cn } from "@utilities";

import { TableVariantProvider } from "@components/atoms/table";

export const Table = ({
	children,
	className,
	variant,
}: TableProps & {
	variant?: ColorSchemes;
}) => {
	const tableStyle = cn(
		"scrollbar overflow-y-auto rounded-t-14 text-white",
		{ "border border-gray-600": variant === "light" },
		className
	);

	return (
		<TableVariantProvider variant={variant}>
			<div className={tableStyle}>
				<table className="h-full min-w-full">{children}</table>
			</div>
		</TableVariantProvider>
	);
};

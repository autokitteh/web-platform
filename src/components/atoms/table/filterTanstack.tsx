import React, { useMemo } from "react";

import { FilterTableTanstackProps, FilterVariantColumnTable, SelectOption } from "@interfaces/components";
import { Input } from "@src/components/atoms/input";

import { Select } from "@components/molecules";

export const FilterTableTanstack = <TData,>({ column }: FilterTableTanstackProps<TData>) => {
	const { filterVariant } = (column.columnDef.meta || {}) as FilterVariantColumnTable;
	const columnFilterValue = column.getFilterValue();

	const sortedUniqueValues = useMemo(
		() => Array.from(column.getFacetedUniqueValues().keys()).sort().slice(0, 5000),
		[column]
	);

	if (filterVariant === "select") {
		const options: SelectOption[] = sortedUniqueValues.map((value) => ({
			label: String(value),
			value: String(value),
		}));

		return (
			<div className="rounded-md">
				<Select
					onChange={(selected) => column.setFilterValue(selected?.value)}
					options={options}
					placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
					value={
						columnFilterValue
							? { label: String(columnFilterValue), value: String(columnFilterValue) }
							: null
					}
					variant="light"
				/>
			</div>
		);
	}

	if (filterVariant === "search") {
		return (
			<Input
				className="h-7 rounded-md"
				onChange={(e) => column.setFilterValue(e.target.value)}
				placeholder="Search..."
				type="text"
				value={columnFilterValue as string}
				variant="light"
			/>
		);
	}

	return null;
};

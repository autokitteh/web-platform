import React, { useMemo } from "react";

import debounce from "lodash/debounce"; // імпорт lodash debounce

import { FilterTableTanstackProps, FilterVariantColumnTable, SelectOption } from "@interfaces/components";
import { Input } from "@src/components/atoms";

import { Select } from "@components/molecules";

export const FilterTableTanstack = <TData,>({ column }: FilterTableTanstackProps<TData>) => {
	const { filterVariant } = (column.columnDef.meta || {}) as FilterVariantColumnTable;
	const columnFilterValue = column.getFilterValue();

	const sortedUniqueValues = useMemo(
		() => Array.from(column.getFacetedUniqueValues().keys()).sort().slice(0, 5000),
		[column]
	);

	// Додаємо дебаунсований сеттер для input
	const debouncedSetFilter = useMemo(
		() =>
			debounce((value: string) => {
				column.setFilterValue(value);
			}, 300), // 300 мс затримка
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
					label="Filter..."
					onChange={(selected) => column.setFilterValue(selected?.value)}
					options={options}
					value={
						columnFilterValue
							? { label: String(columnFilterValue), value: String(columnFilterValue) }
							: null
					}
				/>
			</div>
		);
	}

	if (filterVariant === "search") {
		return (
			<Input
				className="my-0.5 h-8 w-2/3 rounded-md"
				label="Search..."
				onChange={(e) => debouncedSetFilter(e.target.value)} // Використовуємо дебаунс
				type="text"
				value={columnFilterValue as string}
			/>
		);
	}

	return null;
};

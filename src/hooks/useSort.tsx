import { useCallback, useMemo, useState } from "react";

import { orderBy } from "lodash";

import { initialSortConfig } from "@constants";
import { SortDirectionVariant } from "@enums/components";
import { SortConfig } from "@type";

export const useSort = <T,>(items: T[], initialSortKey?: keyof T) => {
	const [sortConfig, setSortConfig] = useState<SortConfig<T>>(
		initialSortKey ? { direction: SortDirectionVariant.ASC, key: initialSortKey } : initialSortConfig
	);

	const sortedItems = useMemo(() => {
		if (!sortConfig.key) {
			return items;
		}

		return orderBy(
			items,
			[
				(item) => {
					const value = item[sortConfig.key];

					return typeof value === "string" ? value.toLowerCase() : value;
				},
			],
			[sortConfig.direction]
		);
	}, [items, sortConfig]);

	const requestSort = useCallback((key: keyof T) => {
		setSortConfig((prevConfig) => ({
			direction:
				prevConfig.key === key && prevConfig.direction === SortDirectionVariant.ASC
					? SortDirectionVariant.DESC
					: SortDirectionVariant.ASC,
			key,
		}));
	}, []);

	return { items: sortedItems, requestSort, sortConfig };
};

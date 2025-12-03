import { useCallback, useMemo, useState } from "react";

import { sort } from "radash";

import { initialSortConfig } from "@constants";
import { SortDirectionVariant } from "@enums/components";
import { SortConfig } from "@type";

export const useSort = <T,>(items: T[], initialSortKey?: keyof T) => {
	const [sortConfig, setSortConfig] = useState<SortConfig<T>>(
		initialSortKey ? { direction: SortDirectionVariant.ASC, key: initialSortKey } : initialSortConfig
	);

	const sortedItems = useMemo(() => {
		if (!sortConfig.key) {
			return [...items];
		}

		const getValue = (item: T) => {
			const value = sortConfig.key ? item[sortConfig.key] : undefined;

			if (value === undefined || value === null) {
				return sortConfig.direction === SortDirectionVariant.ASC ? Number.MAX_VALUE : Number.MIN_VALUE;
			}

			return typeof value === "string" ? value.toLowerCase() : value;
		};

		const sorted = sort(items, getValue as (item: T) => number);
		return sortConfig.direction === SortDirectionVariant.DESC ? sorted.reverse() : sorted;
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

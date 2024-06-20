import { useState, useMemo, useCallback } from "react";
import { initialSortConfig } from "@constants";
import { SortDirectionVariant } from "@enums/components";
import { SortConfig } from "@type";
import { orderBy } from "lodash";

export const useSort = <T,>(items: T[]) => {
	const [sortConfig, setSortConfig] = useState<SortConfig<T>>(initialSortConfig);

	const sortedItems = useMemo(() => {
		if (!sortConfig.key) return items;
		return orderBy(items, [sortConfig.key], [sortConfig.direction]);
	}, [items, sortConfig]);

	const requestSort = useCallback((key: keyof T) => {
		setSortConfig((prevConfig) => ({
			key,
			direction:
				prevConfig.key === key && prevConfig.direction === SortDirectionVariant.ASC
					? SortDirectionVariant.DESC
					: SortDirectionVariant.ASC,
		}));
	}, []);

	return { items: sortedItems, sortConfig, requestSort };
};

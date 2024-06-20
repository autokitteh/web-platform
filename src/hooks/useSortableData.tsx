import { useState, useMemo, useCallback } from "react";
import { initialSortConfig } from "@constants";
import { SortDirectionVariant } from "@enums/components";
import { SortConfig } from "@type";
import { orderBy } from "lodash";

export const useSortableData = <T,>(list: T[]) => {
	const [sortConfig, setSortConfig] = useState<SortConfig<T>>(initialSortConfig);

	const sortedList = useMemo(() => {
		if (!sortConfig.key) return list;
		return orderBy(list, [sortConfig.key], [sortConfig.direction]);
	}, [list, sortConfig]);

	const requestSort = useCallback((key: keyof T) => {
		setSortConfig((prevConfig) => ({
			key,
			direction:
				prevConfig.key === key && prevConfig.direction === SortDirectionVariant.ASC
					? SortDirectionVariant.DESC
					: SortDirectionVariant.ASC,
		}));
	}, []);

	return { list: sortedList, sortConfig, requestSort };
};

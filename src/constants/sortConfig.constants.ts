import { SortDirectionVariant } from "@enums/components";
import { SortConfig } from "@type";

export const initialSortConfig: SortConfig<any> = {
	direction: SortDirectionVariant.DESC,
	key: undefined,
};

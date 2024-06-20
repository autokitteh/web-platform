import { SortDirectionVariant } from "@enums/components";
import { SortConfig } from "@type";

export const initialSortConfig: SortConfig<any> = {
	key: undefined,
	direction: SortDirectionVariant.DESC,
};

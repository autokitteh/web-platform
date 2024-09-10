import { SortDirectionVariant } from "@enums/components";

export type SortConfig<T> = {
	direction: SortDirectionVariant;
	key?: keyof T;
};

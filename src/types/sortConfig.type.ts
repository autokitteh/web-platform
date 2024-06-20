import { SortDirectionVariant } from "@enums/components";

export type SortConfig<T> = {
	key?: keyof T;
	direction: SortDirectionVariant;
};

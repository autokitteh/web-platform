import { SortOrder } from "@enums";

type WithOptionalProperty<TKey extends PropertyKey> = { [P in TKey]?: any };

export const sortArray = <TItem extends WithOptionalProperty<TKey>, TKey extends PropertyKey>(
	arr: TItem[] | undefined,
	propName: TKey,
	order: SortOrder = SortOrder.ASC
): void => {
	arr?.sort((a, b) => {
		const aProp: any = a[propName];
		const bProp: any = b[propName];
		let comparison = 0;

		if (typeof aProp === "number") {
			comparison = aProp - bProp;
		} else if (typeof aProp === "string") {
			comparison = aProp.localeCompare(bProp);
		} else if (aProp instanceof Date) {
			comparison = aProp.getTime() - bProp.getTime();
		} else {
			return 0;
		}

		return order === SortOrder.ASC ? comparison : -comparison;
	});
};

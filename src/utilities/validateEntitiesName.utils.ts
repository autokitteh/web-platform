import { t } from "i18next";

export const isNameExist = (value: string, existingValuesSet: Set<string>): string =>
	existingValuesSet.has(value)
		? t("validateEntityName.nameIsTaken", {
				ns: "utilities",
			})
		: "";

export const isNameEmpty = (value?: string): string =>
	value ? "" : t("validateEntityName.nameRequired", { ns: "utilities" });

export const isNameInvalid = (value: string): string =>
	!new RegExp("^[a-zA-Z_][\\w]*$").test(value)
		? t("validateEntityName.invalidName", {
				ns: "utilities",
			})
		: "";

export const validateEntitiesName = (value: string, existingValuesSet: Set<string>): string => {
	return isNameEmpty(value) || isNameExist(value, existingValuesSet) || isNameInvalid(value);
};

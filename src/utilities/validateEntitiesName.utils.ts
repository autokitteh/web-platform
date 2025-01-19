import i18n from "i18next";

export const isNameExist = (value: string, existingValuesSet: Set<string>): string =>
	existingValuesSet.has(value)
		? i18n.t("validateEntityName.nameIsTaken", {
				ns: "utilities",
			})
		: "";

export const isNameEmpty = (value?: string): string =>
	value ? "" : i18n.t("validateEntityName.nameRequired", { ns: "utilities" });

export const isNameInvalid = (value: string): string =>
	!new RegExp("^[a-zA-Z_][\\w]*$").test(value)
		? i18n.t("validateEntityName.invalidName", {
				ns: "utilities",
			})
		: "";

export const validateEntitiesName = (value: string, existingValuesSet: Set<string>): string | undefined => {
	return isNameEmpty(value) || isNameExist(value, existingValuesSet) || isNameInvalid(value);
};

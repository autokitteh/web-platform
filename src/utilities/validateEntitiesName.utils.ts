import i18n from "i18next";

<<<<<<< HEAD
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

export const validateEntitiesName = (value: string, existingValuesSet: Set<string>): string => {
	return isNameEmpty(value) || isNameExist(value, existingValuesSet) || isNameInvalid(value);
=======
export const validateEntitiesName = (value: string, existingValuesSet: Set<string>): string | undefined => {
	if (existingValuesSet.has(value)) {
		return i18n.t("validateEntityName.nameIsTaken", {
			ns: "utilities",
		});
	}
	if (!new RegExp("^[a-zA-Z_][\\w]*$").test(value)) {
		return i18n.t("validateEntityName.invalidName", {
			ns: "utilities",
		});
	}
	return;
>>>>>>> 8769c279 (feat(UI-1191): organizations settings - name update)
};

import i18n from "i18next";

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
};

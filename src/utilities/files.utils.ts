export const hasInvalidCharacters = (name: string): boolean => {
	const invalidChars = /[<>:"/\\|?*]/;
	if (invalidChars.test(name)) return true;

	for (let i = 0; i < name.length; i++) {
		const code = name.charCodeAt(i);
		if (code < 32) return true;
	}
	return false;
};

export const validateFileName = (name: string, t: (key: string) => string): { error: string; isValid: boolean } => {
	if (!name.trim()) {
		return { isValid: false, error: t("fileName.nameRequired") };
	}

	const invalidChars = /[<>:"/\\|?*]/;
	if (invalidChars.test(name)) {
		return { isValid: false, error: t("fileName.invalidCharacters") };
	}

	for (let i = 0; i < name.length; i++) {
		if (name.charCodeAt(i) < 32) {
			return { isValid: false, error: t("fileName.invalidCharacters") };
		}
	}

	if (name !== name.trim()) {
		return { isValid: false, error: t("fileName.leadingTrailingSpaces") };
	}

	return { isValid: true, error: "" };
};

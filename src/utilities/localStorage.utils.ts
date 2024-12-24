export const getAutoSavePreference = () => {
	const savedPreference = localStorage.getItem("codeAutoSave");

	return savedPreference === null ? true : savedPreference === "true";
};

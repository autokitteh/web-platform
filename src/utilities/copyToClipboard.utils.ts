import i18n from "i18next";

export const copyToClipboard = async (text: string): Promise<{ isError: boolean; message: string }> => {
	try {
		await navigator.clipboard.writeText(text);

		return { isError: false, message: i18n.t("copySuccess", { ns: "global" }) };
	} catch (error) {
		return { isError: false, message: i18n.t("copyFailure", { ns: "global" }) };
	}
};
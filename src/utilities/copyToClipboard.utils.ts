import i18n from "i18next";

export const copyToClipboard = async (text: string): Promise<{ isError: boolean; message: string }> => {
	try {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(text);
		} else {
			const textArea = document.createElement("textarea");
			textArea.value = text;
			textArea.style.position = "fixed";
			textArea.style.left = "-999999px";
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
		}

		return { isError: false, message: i18n.t("copySuccess", { ns: "global" }) };
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		return { isError: true, message: i18n.t("copyFailure", { ns: "global" }) };
	}
};

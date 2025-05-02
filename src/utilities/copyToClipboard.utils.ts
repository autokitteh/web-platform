import { t } from "i18next";

const retryCopyToClipboard = (text: string): { isError: boolean; message: string } => {
	try {
		const textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.style.position = "fixed";
		textArea.style.left = "-999999px";
		document.body.appendChild(textArea);
		textArea.select();
		document.execCommand("copy");
		document.body.removeChild(textArea);

		return { isError: false, message: t("copySuccess", { ns: "global" }) };
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		return { isError: true, message: t("copyFailure", { ns: "global" }) };
	}
};

export const copyToClipboard = async (text: string): Promise<{ isError: boolean; message: string }> => {
	try {
		await new Promise((resolve) => setTimeout(resolve, 0));

		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(text);
		} else {
			return retryCopyToClipboard(text);
		}

		return { isError: false, message: t("copySuccess", { ns: "global" }) };
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		return retryCopyToClipboard(text);
	}
};

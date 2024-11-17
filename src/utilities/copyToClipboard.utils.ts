import i18n from "i18next";

export const copyToClipboard = async (text: string): Promise<{ isError: boolean; message: string }> => {
	try {
		await navigator.clipboard.writeText(text);

		const tempInput = document.createElement("input");
		tempInput.style.cssText = "position: absolute; left: -1000px; top: -1000px";
		tempInput.value = text;
		document.body.appendChild(tempInput);
		tempInput.select();
		document.execCommand("copy");
		document.body.removeChild(tempInput);

		return { isError: false, message: i18n.t("copySuccess", { ns: "global" }) };
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		return { isError: false, message: i18n.t("copyFailure", { ns: "global" }) };
	}
};

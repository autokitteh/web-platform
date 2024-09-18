import i18n from "i18next";

let infoCardPythonCode: { linkHref?: string; linkText?: string; text: string }[] = [];
let infoCardVSCode: { text: string }[] = [];

i18n.on("initialized", () => {
	infoCardPythonCode = [
		{
			text: i18n.t("welcome.cards.startingProject.developPythonCode", { ns: "dashboard" }),
			linkText: i18n.t("welcome.cards.startingProject.docs", { ns: "dashboard" }),
			linkHref: "#",
		},
		{
			text: i18n.t("welcome.cards.startingProject.configure", { ns: "dashboard" }),
			linkText: i18n.t("welcome.cards.startingProject.connectionsToApplications", { ns: "dashboard" }),
			linkHref: "#",
		},
		{
			text: i18n.t("welcome.cards.startingProject.configure", { ns: "dashboard" }),
			linkText: i18n.t("welcome.cards.startingProject.triggers", { ns: "dashboard" }),
			linkHref: "#",
		},
		{ text: i18n.t("welcome.cards.startingProject.setVarsOptional", { ns: "dashboard" }) },
	];

	infoCardVSCode = [
		{ text: i18n.t("welcome.cards.developInVSCode.synchronizationWithServer", { ns: "dashboard" }) },
		{ text: i18n.t("welcome.cards.developInVSCode.quickActions", { ns: "dashboard" }) },
		{ text: i18n.t("welcome.cards.developInVSCode.devTools", { ns: "dashboard" }) },
		{ text: i18n.t("welcome.cards.developInVSCode.autocomplete", { ns: "dashboard" }) },
	];
});

export { infoCardPythonCode, infoCardVSCode };

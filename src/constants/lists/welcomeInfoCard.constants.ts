import i18n from "i18next";

let infoCardPythonCode: { href: string; text: string }[] = [];
let infoCardVSCode: { text: string }[] = [];

i18n.on("initialized", () => {
	infoCardPythonCode = [
		{
			text: i18n.t("welcome.cards.startingProject.firstBullet", { ns: "dashboard" }),
			href: "https://docs.autokitteh.com/develop/python",
		},
		{
			text: i18n.t("welcome.cards.startingProject.secondBullet", { ns: "dashboard" }),
			href: "https://docs.autokitteh.com/develop/python",
		},
		{
			text: i18n.t("welcome.cards.startingProject.thirdBullet", { ns: "dashboard" }),
			href: "https://docs.autokitteh.com/integrations",
		},
		{
			text: i18n.t("welcome.cards.startingProject.fourthBullet", { ns: "dashboard" }),
			href: "https://github.com/autokitteh/kittehub",
		},
	];

	infoCardVSCode = [
		{ text: i18n.t("welcome.cards.developInVSCode.synchronizationWithServer", { ns: "dashboard" }) },
		{ text: i18n.t("welcome.cards.developInVSCode.quickActions", { ns: "dashboard" }) },
		{ text: i18n.t("welcome.cards.developInVSCode.devTools", { ns: "dashboard" }) },
		{ text: i18n.t("welcome.cards.developInVSCode.autocomplete", { ns: "dashboard" }) },
	];
});

export { infoCardPythonCode, infoCardVSCode };

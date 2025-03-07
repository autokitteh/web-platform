import { t } from "i18next";

export let infoCronExpressionsLinks: { additionalText: string; text: string; url: string }[] = [];
export let extraTriggerTypes = [
	{
		label: "Scheduler",
		value: "schedule",
	},
	{
		label: "Webhook",
		value: "webhook",
	},
];

i18n.on("initialized", () => {
	infoCronExpressionsLinks = [
		{
			text: t("triggers.form.info.firstLink", { ns: "tabs" }),
			url: "https://crontab.guru/",
			additionalText: t("triggers.form.info.firstLinkText", { ns: "tabs" }),
		},
		{
			text: t("triggers.form.info.secondLink", { ns: "tabs" }),
			url: "https://github.com/autokitteh/kittehub/tree/main/samples/scheduler#api-documentation",
			additionalText: t("triggers.form.info.secondLinkText", { ns: "tabs" }),
		},
		{
			text: t("triggers.form.info.thirdLink", { ns: "tabs" }),
			url: "https://github.com/autokitteh/kittehub/tree/main/samples/scheduler#api-documentation",
			additionalText: t("triggers.form.info.thirdLinkText", { ns: "tabs" }),
		},
		{
			text: t("triggers.form.info.fourthLink", { ns: "tabs" }),
			url: "https://github.com/autokitteh/kittehub/tree/main/samples/scheduler#api-documentation",
			additionalText: t("triggers.form.info.fourthLinkText", { ns: "tabs" }),
		},
	];

	extraTriggerTypes = [
		{
			label: t("triggers.form.extraConnections.schedulerLabel", { ns: "tabs" }),
			value: "schedule",
		},
		{
			label: t("triggers.form.extraConnections.webhookLabel", { ns: "tabs" }),
			value: "webhook",
		},
	];
});

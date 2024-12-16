import i18n from "i18next";

export let infoCronExpressionsLinks: { text: string; url: string }[] = [];
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
			text: i18n.t("triggers.form.info.firstLink", { ns: "tabs" }),
			url: "https://crontab.guru/",
		},
		{
			text: i18n.t("triggers.form.info.secondLink", { ns: "tabs" }),
			url: "https://github.com/autokitteh/kittehub/tree/main/samples/scheduler#api-documentation",
		},
	];

	extraTriggerTypes = [
		{
			label: i18n.t("triggers.form.extraConnections.schedulerLabel", { ns: "tabs" }),
			value: "schedule",
		},
		{
			label: i18n.t("triggers.form.extraConnections.webhookLabel", { ns: "tabs" }),
			value: "webhook",
		},
	];
});

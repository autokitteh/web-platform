import i18n, { t } from "i18next";

import { baseTriggerTypes } from "./triggersBase.constants";
import { SelectOption } from "@src/interfaces/components";

import { ClockIcon, WebhookIcon } from "@assets/image/icons";

export let infoCronExpressionsLinks: { additionalText: string; text: string; url: string }[] = [];
let basicTriggerTypes = baseTriggerTypes as SelectOption[];
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

	basicTriggerTypes = [
		{
			label: t("triggers.form.extraConnections.schedulerLabel", { ns: "tabs" }),
			ariaLabel: t("triggers.form.extraConnections.schedulerAriaLabel", { ns: "tabs" }),
			value: "schedule",
			icon: ClockIcon,
			iconClassName: "bg-black",
		},
		{
			label: t("triggers.form.extraConnections.webhookLabel", { ns: "tabs" }),
			ariaLabel: t("triggers.form.extraConnections.webhookAriaLabel", { ns: "tabs" }),
			value: "webhook",
			icon: WebhookIcon,
			iconClassName: "bg-black",
		},
	];
});

export { basicTriggerTypes };

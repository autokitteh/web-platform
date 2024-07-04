import { triggerTypes } from "@constants/lists/connections";
import i18n from "i18next";

export const schedulerTriggerConnectionName = "cron";
export const defaultTriggerType = triggerTypes[0];

export let infoCronExpressionsLinks: { text: string; url: string }[] = [];

i18n.on("initialized", () => {
	infoCronExpressionsLinks = [
		{
			text: i18n.t("triggers.form.info.aboutCron", { ns: "tabs" }),
			url: "https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm",
		},
		{
			text: i18n.t("triggers.form.info.schedules", { ns: "tabs" }),
			url: "https://docs.temporal.io/workflows#robfig-predefined-schedules-and-intervals",
		},
	];
});

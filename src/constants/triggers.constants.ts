import i18n, { t } from "i18next";
import { HiOutlineOfficeBuilding } from "react-icons/hi";

import { baseTriggerTypes, buildBaseConnectionGroups } from "./triggersBase.constants";
import { SelectGroup, SelectOption } from "@src/interfaces/components";
import { Connection } from "@src/types/models";

import { ClockIcon, LinkIcon, WebhookIcon } from "@assets/image/icons";

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
			iconClassName: "bg-black stroke-white",
		},
		{
			label: t("triggers.form.extraConnections.webhookLabel", { ns: "tabs" }),
			ariaLabel: t("triggers.form.extraConnections.webhookAriaLabel", { ns: "tabs" }),
			value: "webhook",
			icon: WebhookIcon,
			iconClassName: "bg-black stroke-white",
		},
	];
});

export const buildConnectionGroups = (
	connections: Connection[],
	orgConnections: Connection[],
	t: (key: string) => string
): SelectGroup[] => {
	const baseGroups = buildBaseConnectionGroups(connections, orgConnections, t);

	return baseGroups.map((group, index) => {
		if (index === 0) {
			return group as SelectGroup;
		}

		if (group.label === t("connectionGroups.projectConnections")) {
			return {
				...group,
				icon: LinkIcon,
				iconClassName: "fill-white",
			} as SelectGroup;
		}

		if (group.label === t("connectionGroups.organizationConnections")) {
			return {
				...group,
				icon: HiOutlineOfficeBuilding,
				iconClassName: "stroke-white stroke-1.5",
			} as SelectGroup;
		}

		return group as SelectGroup;
	});
};

export { basicTriggerTypes };

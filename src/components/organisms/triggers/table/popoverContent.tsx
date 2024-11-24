import React from "react";

import { useTranslation } from "react-i18next";

import { TriggerTypes } from "@src/enums";
import { IntegrationsMap } from "@src/enums/components/connection.enum";
import { useCacheStore } from "@src/store";
import { Trigger } from "@src/types/models";
import { getApiBaseUrl } from "@src/utilities";

import { IconSvg } from "@components/atoms";
import { CopyButton } from "@components/molecules";

import { ClockIcon, LinkIcon, WebhookIcon } from "@assets/image/icons";

export const InformationPopoverContent = ({ trigger }: { trigger: Trigger }) => {
	const apiBaseUrl = getApiBaseUrl();
	const webhookUrl = trigger?.webhookSlug ? `${apiBaseUrl}/webhooks/${trigger.webhookSlug}` : "";
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.infoPopover" });
	const { connections } = useCacheStore();
	const triggerConnection = connections?.find((connection) => connection.connectionId === trigger.connectionId);
	const TriggerConnectionIntegrationKey = Object.keys(IntegrationsMap).find(
		(integration) => integration === (triggerConnection?.integrationName?.toLowerCase() || "")
	);

	const TriggerConnectionItegrationIcon =
		IntegrationsMap[(TriggerConnectionIntegrationKey || "") as keyof typeof IntegrationsMap]?.icon;

	const baseDetails = [
		{ label: t("file"), value: trigger.path },
		{ label: t("entrypoint"), value: trigger.entryFunction },
	];

	const connectionDetails = [
		{
			label: t("connection"),
			value: triggerConnection?.name,
			icon: TriggerConnectionItegrationIcon,
		},
		{
			label: t("connectionId"),
			value: triggerConnection?.connectionId,
		},
		...baseDetails,
		{ label: t("eventType"), value: trigger.eventType },
		{ label: t("filter"), value: trigger.filter },
	];

	const scheduleDetails = [{ label: t("cron"), value: trigger.schedule }, ...baseDetails];

	switch (trigger.sourceType) {
		case TriggerTypes.webhook:
			return (
				<div className="text-white">
					<div className="mb-2 flex w-64 font-semibold">
						<IconSvg className="mr-2" src={WebhookIcon} />
						{t("info")}
					</div>
					<div className="flex items-center gap-x-1">
						<div className="font-semibold">{t("webhookUrl")}:</div>
						{webhookUrl}
						<div className="w-8">
							<CopyButton size="sm" text={webhookUrl} />
						</div>
					</div>
					{baseDetails.map(({ label, value }) =>
						value ? (
							<div className="flex items-center gap-x-1" key={label}>
								<div className="font-semibold">{label}:</div>
								<div>{value}</div>
							</div>
						) : null
					)}
				</div>
			);
		case TriggerTypes.schedule:
			return (
				<div className="text-white">
					<div className="mb-2 flex w-full">
						<div className="flex w-64 font-semibold">
							<IconSvg className="mr-2" src={ClockIcon} />
							{t("info")}
						</div>
						<div className="w-full" />
					</div>

					{scheduleDetails.map(({ label, value }) =>
						value ? (
							<div className="flex items-center gap-x-1" key={label}>
								<div className="font-semibold">{label}:</div>
								<div>{value}</div>
							</div>
						) : null
					)}
				</div>
			);
		case TriggerTypes.connection:
			return (
				<div className="text-white">
					<div className="mb-2 flex w-full">
						<div className="flex w-64 font-semibold">
							<IconSvg className="mr-2 fill-white" src={LinkIcon} />
							{t("info")}
						</div>
						<div className="w-full" />
					</div>
					{connectionDetails.map(({ icon: Icon, label, value }) =>
						value ? (
							<div className="flex items-center gap-x-1" key={label}>
								<div className="font-semibold">{label}:</div>
								{Icon ? <Icon className="size-4" /> : null}
								{value}
							</div>
						) : null
					)}
				</div>
			);
		default:
			return null;
	}
};

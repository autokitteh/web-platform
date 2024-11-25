import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { IntegrationsService } from "@services/integrations.service";
import { TriggerTypes } from "@src/enums";
import { IntegrationsMap } from "@src/enums/components/connection.enum";
import { useCacheStore } from "@src/store";
import { Trigger } from "@src/types/models";
import { getApiBaseUrl } from "@src/utilities";

import { IconSvg } from "@components/atoms";
import { CopyButton } from "@components/molecules";

import { ClockIcon, LinkIcon, WebhookIcon } from "@assets/image/icons";

type TriggerInformation = {
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	label: string;
	value?: string;
};

export const InformationPopoverContent = ({ trigger }: { trigger: Trigger }) => {
	const apiBaseUrl = getApiBaseUrl();
	const webhookUrl = trigger?.webhookSlug ? `${apiBaseUrl}/webhooks/${trigger.webhookSlug}` : "";
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.infoPopover" });
	const { connections } = useCacheStore();
	const [connectionDetails, setConnectionDetails] = useState<TriggerInformation[]>();
	const [scheduleDetails, setScheduleDetails] = useState<TriggerInformation[]>([]);

	const baseDetails = [
		{ label: t("file"), value: trigger.path },
		{ label: t("entrypoint"), value: trigger.entryFunction },
	];

	const configureTriggerDisplay = async (trigger: Trigger) => {
		const triggerConnection = connections?.find((connection) => connection.connectionId === trigger.connectionId);
		const { data: integrations } = await IntegrationsService.list();
		const TriggerConnectionIntegrationKey = integrations?.find(
			(integration) => integration.integrationId === triggerConnection?.integrationId
		)?.uniqueName;

		const TriggerConnectionItegrationIcon =
			IntegrationsMap[(TriggerConnectionIntegrationKey || "") as keyof typeof IntegrationsMap]?.icon;

		setConnectionDetails([
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
		]);

		setScheduleDetails([{ label: t("cron"), value: trigger.schedule }, ...baseDetails]);
	};

	useEffect(() => {
		configureTriggerDisplay(trigger);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trigger]);

	return trigger.sourceType === TriggerTypes.webhook ? (
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
	) : trigger.sourceType === TriggerTypes.schedule ? (
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
	) : trigger.sourceType === TriggerTypes.connection ? (
		<div className="text-white">
			<div className="mb-2 flex w-full">
				<div className="flex w-64 font-semibold">
					<IconSvg className="mr-2 fill-white" src={LinkIcon} />
					{t("info")}
				</div>
				<div className="w-full" />
			</div>
			{connectionDetails?.map(({ icon: Icon, label, value }) =>
				value ? (
					<div className="flex items-center gap-x-1" key={label}>
						<div className="font-semibold">{label}:</div>
						{Icon ? <Icon className="mx-1 size-4 shrink-0 rounded-full bg-white p-0.5" /> : null}
						{value}
					</div>
				) : null
			)}
		</div>
	) : null;
};

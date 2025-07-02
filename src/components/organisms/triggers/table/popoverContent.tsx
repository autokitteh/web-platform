import React, { ComponentType, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { IntegrationsService } from "@services/integrations.service";
import { TriggerTypes } from "@src/enums";
import { IntegrationsMap } from "@src/enums/components/connection.enum";
import { useCacheStore } from "@src/store";
import { TriggerPopoverInformation } from "@src/types/components/tables";
import { Trigger } from "@src/types/models";
import { cn, getApiBaseUrl, stripGoogleConnectionName } from "@src/utilities";

import { IconSvg } from "@components/atoms";
import { CopyButton, IdCopyButton } from "@components/molecules";

import { ClockIcon, WebhookIcon } from "@assets/image/icons";

export const InformationPopoverContent = ({ trigger }: { trigger: Trigger }) => {
	const apiBaseUrl = getApiBaseUrl();
	const webhookUrl = trigger?.webhookSlug ? `${apiBaseUrl}/webhooks/${trigger.webhookSlug}` : "";
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.infoPopover" });
	const { connections } = useCacheStore();
	const [connectionDetails, setConnectionDetails] = useState<TriggerPopoverInformation[]>();
	const [scheduleDetails, setScheduleDetails] = useState<TriggerPopoverInformation[]>([]);
	const [connectionIcon, setConnectionIcon] = useState<ComponentType<React.SVGProps<SVGSVGElement>> | null>(null);
	const baseDetails = [
		{ label: t("file"), value: trigger?.path },
		{ label: t("entrypoint"), value: trigger?.entryFunction },
	];

	const configureTriggerDisplay = async (trigger: Trigger) => {
		if (trigger.sourceType === TriggerTypes.schedule) {
			setScheduleDetails([{ label: t("cron"), value: trigger.schedule }, ...baseDetails]);

			return;
		}

		const triggerConnection = connections?.find((connection) => connection.connectionId === trigger.connectionId);
		const { data: integrations } = await IntegrationsService.list();
		const TriggerConnectionIntegrationKey = stripGoogleConnectionName(
			integrations?.find((integration) => integration.integrationId === triggerConnection?.integrationId)
				?.uniqueName || ""
		);

		setConnectionIcon(
			IntegrationsMap[(TriggerConnectionIntegrationKey || "") as keyof typeof IntegrationsMap]?.icon
		);

		setConnectionDetails([
			{
				label: t("connection"),
				value: triggerConnection?.name,
			},
			{
				label: triggerConnection?.connectionId ? (
					t("connectionId")
				) : (
					<div className="text-error">{t("connectionNotFound")}</div>
				),
				value: triggerConnection?.connectionId ? (
					<IdCopyButton displayFullLength id={triggerConnection.connectionId} />
				) : (
					" "
				),
			},
			...baseDetails,
			{ label: t("eventType"), value: trigger.eventType },
			{ label: t("filter"), value: trigger.filter },
		]);
	};

	useEffect(() => {
		configureTriggerDisplay(trigger);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trigger]);

	const renderTriggerContent = (
		icon: ComponentType<React.SVGProps<SVGSVGElement>> | null,
		details: TriggerPopoverInformation[],
		isConnectionTrigger = false
	) => (
		<div className="text-white">
			<div className="mb-2 flex w-full">
				<div className="flex w-64 font-semibold">
					{icon ? (
						<IconSvg
							className={cn("mr-2", {
								"size-4 shrink-0 rounded-full bg-white p-0.5": isConnectionTrigger,
							})}
							src={icon}
						/>
					) : null}
					{t("info")}
				</div>
				<div className="w-full" />
			</div>
			{details.map(
				({ label, value }, index) =>
					value && (
						<div className="flex items-center gap-x-1" key={index}>
							<div className="font-semibold">
								{label}
								{value.toString().trim() ? ":" : null}
							</div>
							{value}
						</div>
					)
			)}
		</div>
	);

	const webhookContent = trigger.sourceType === TriggerTypes.webhook && (
		<div className="text-white">
			<div className="mb-2 flex w-64 font-semibold">
				<IconSvg className="mr-2" src={WebhookIcon} />
				{t("info")}
			</div>
			<div className="flex items-center gap-x-1">
				<div className="font-semibold">{t("webhookUrl")}:</div>
				{webhookUrl}
				<CopyButton className="size-7" text={webhookUrl} />
			</div>
			{baseDetails.map(({ label, value }) =>
				value ? (
					<div className="flex items-center gap-x-1" key={label}>
						<div className="font-semibold">{label}:</div>
						{value}
					</div>
				) : null
			)}
		</div>
	);

	return trigger.sourceType === TriggerTypes.webhook
		? webhookContent
		: trigger.sourceType === TriggerTypes.schedule
			? renderTriggerContent(ClockIcon, scheduleDetails)
			: trigger.sourceType === TriggerTypes.connection
				? renderTriggerContent(connectionIcon, connectionDetails || [], true)
				: null;
};

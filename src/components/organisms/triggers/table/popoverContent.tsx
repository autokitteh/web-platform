import React from "react";

import { useTranslation } from "react-i18next";

import { TriggerTypes } from "@src/enums";
import { Trigger } from "@src/types/models";
import { getApiBaseUrl } from "@src/utilities";

import { IconSvg } from "@components/atoms";
import { CopyButton, PopoverClose } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const InformationPopoverContent = ({ trigger }: { trigger: Trigger }) => {
	const apiBaseUrl = getApiBaseUrl();
	const webhookUrl = trigger?.webhookSlug ? `${apiBaseUrl}/webhooks/${trigger.webhookSlug}` : "";
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.infoPopover" });

	switch (trigger.sourceType) {
		case TriggerTypes.webhook:
			return (
				<div className="text-white">
					<div className="mb-2 flex w-full">
						<div className="w-64 font-semibold">{t("webhookUrl")}</div>
						<div className="w-full" />
						<PopoverClose>
							<IconSvg className="size-3 fill-white" src={Close} />
						</PopoverClose>
					</div>
					<div className="flex items-center">
						<div>{webhookUrl}</div>
						<div className="w-full" />
						<div className="w-8">
							<CopyButton size="sm" text={webhookUrl} />
						</div>
					</div>
				</div>
			);
		case TriggerTypes.schedule:
			return (
				<div className="text-white">
					<div className="mb-2 flex w-full">
						<div className="w-64 font-semibold">{t("cron")}</div>
						<div className="w-full" />
						<PopoverClose>
							<IconSvg className="size-3 fill-white" src={Close} />
						</PopoverClose>
					</div>
					<div className="flex w-full items-center">
						{trigger.schedule}
						<CopyButton size="sm" text={trigger?.schedule || ""} />
					</div>
				</div>
			);
		case TriggerTypes.connection:
			return (
				<div className="text-white">
					<div className="mb-2 flex w-full">
						<div className="w-64 font-semibold">{t("info")}</div>
						<div className="w-full" />
						<div>
							<PopoverClose>
								<IconSvg className="size-3 fill-white" src={Close} />
							</PopoverClose>
						</div>
					</div>
					{trigger.path ? (
						<div className="flex items-center gap-x-1">
							<div className="font-semibold">{t("file")}:</div>
							{trigger.path}
							<CopyButton size="sm" text={trigger.path} />
						</div>
					) : null}
					{trigger.entryFunction ? (
						<div className="flex items-center gap-x-1">
							<div className="font-semibold">{t("entrypoint")}:</div>
							{trigger.entryFunction}
							<CopyButton size="sm" text={trigger.entryFunction} />
						</div>
					) : null}
					{trigger.eventType ? (
						<div className="flex items-center gap-x-1">
							<div className="font-semibold">{t("eventType")}:</div>
							<div>{trigger.eventType}</div>
							<CopyButton size="sm" text={trigger.eventType} />
						</div>
					) : null}
					{trigger.filter ? (
						<div className="flex items-center gap-x-1">
							<div className="font-semibold">{t("filter")}:</div>
							<div>{trigger.filter}</div>
							<CopyButton size="sm" text={trigger.filter} />
						</div>
					) : null}
				</div>
			);
		default:
			return null;
	}
};

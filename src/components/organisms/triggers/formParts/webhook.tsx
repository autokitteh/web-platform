import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { cn, getApiBaseUrl } from "@src/utilities";

import { Input } from "@components/atoms";
import { CopyButton } from "@components/molecules";

export const WebhookFields = ({ highlight, webhookSlug }: { highlight?: boolean; webhookSlug?: string }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const apiBaseUrl = getApiBaseUrl();

	const [webhookUrl, setWebhookUrl] = useState<string>("");

	useEffect(() => {
		setWebhookUrl(webhookSlug ? `${apiBaseUrl}/webhooks/${webhookSlug}` : t("webhookWillBeGenerated"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const webhookClassName = cn("w-full", { "shadow-sm shadow-green-200/80": highlight });

	return (
		<div className="relative flex gap-2">
			<Input
				aria-label={t("placeholders.webhookUrl")}
				className={webhookClassName}
				data-testid="webhook-url"
				disabled
				label={t("placeholders.webhookUrl")}
				name="webhookUrl"
				value={webhookUrl}
			/>

			<CopyButton text={webhookUrl} />
		</div>
	);
};

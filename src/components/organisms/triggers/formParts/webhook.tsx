import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { getApiBaseUrl } from "@src/utilities";

import { Input } from "@components/atoms";
import { CopyButton } from "@components/molecules";

export const WebhookFields = ({ webhookSlug }: { webhookSlug?: string }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const apiBaseUrl = getApiBaseUrl();

	const [webhookUrl, setWebhookUrl] = useState<string>("");

	useEffect(() => {
		setWebhookUrl(webhookSlug ? `${apiBaseUrl}/${webhookSlug}` : t("webhookWillBeGenerated"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="relative flex gap-2">
			<Input
				aria-label={t("placeholders.webhookUrl")}
				className="w-full"
				disabled
				label={t("placeholders.webhookUrl")}
				name="webhookUrl"
				value={webhookUrl}
			/>

			<CopyButton text={webhookUrl} />
		</div>
	);
};

import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { copyToClipboard, getApiBaseUrl } from "@src/utilities";

import { Button, Input } from "@components/atoms";

import { CopyIcon } from "@assets/image/icons";

export const WebhookFields = ({ webhookSlug }: { webhookSlug?: string }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tGlobal } = useTranslation("global");
	const apiBaseUrl = getApiBaseUrl();

	const [webhookUrl, setWebhookUrl] = useState<string>("");

	useEffect(() => {
		setWebhookUrl(
			webhookSlug ? `${apiBaseUrl}/${webhookSlug}` : "The webhook URL will be generated after saving the trigger."
		);
	}, [webhookSlug, apiBaseUrl]);

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

			<Button
				aria-label={tGlobal("copy")}
				className="w-fit rounded-md border-black bg-white px-5 font-semibold hover:bg-gray-950"
				onClick={() => copyToClipboard(webhookUrl)}
				variant="outline"
			>
				<CopyIcon className="h-3.5 w-3.5 fill-black" />

				{tGlobal("copy")}
			</Button>
		</div>
	);
};

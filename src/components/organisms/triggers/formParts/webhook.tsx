import React, { useEffect, useState } from "react";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { cn, getApiBaseUrl } from "@src/utilities";
import { TriggerFormData } from "@validations";

import { ErrorMessage, Input, Link } from "@components/atoms";
import { CopyButton, Select } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

export const WebhookFields = ({
	connectionId,
	highlight,
	selectedHttpMethod,
	webhookSlug,
}: {
	connectionId: string;
	highlight?: boolean;
	selectedHttpMethod?: string;
	webhookSlug?: string;
}) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const apiBaseUrl = getApiBaseUrl();

	const [webhookUrl, setWebhookUrl] = useState<string>("");

	const {
		control,
		formState: { errors },
		register,
		setValue,
	} = useFormContext<TriggerFormData>();
	const watchedEventTypeSelect = useWatch({ control, name: "eventTypeSelect" });

	const selectedHTTPMethodOption = selectedHttpMethod
		? { value: selectedHttpMethod, label: selectedHttpMethod }
		: undefined;

	useEffect(() => {
		setWebhookUrl(webhookSlug ? `${apiBaseUrl}/webhooks/${webhookSlug}` : t("webhookWillBeGenerated"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setValue("eventTypeSelect", undefined);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const webhookClassName = cn("w-full", { "shadow-sm shadow-green-200/80": highlight });

	const selectHTTPMethods = httpMethods.map((method) => ({
		value: method,
		label: method,
	}));

	const watchedFilter = useWatch({ control, name: "filter" });

	return (
		<>
			<div className="flex flex-col gap-2">
				<Controller
					control={control}
					name="eventTypeSelect"
					render={({ field }) => (
						<Select
							{...field}
							aria-label={t("placeholders.httpMethod")}
							defaultValue={selectedHTTPMethodOption}
							isError={!!errors.eventTypeSelect}
							label={t("placeholders.httpMethod")}
							noOptionsLabel={t("placeholders.httpMethodSelect")}
							options={selectHTTPMethods}
							placeholder={t("placeholders.httpMethodSelect")}
							value={watchedEventTypeSelect}
						/>
					)}
				/>
				<ErrorMessage>{errors.eventTypeSelect?.message as string}</ErrorMessage>
				<Link
					className="group inline-flex items-center gap-2.5 pl-1 text-green-800"
					target="_blank"
					to={t("webhookInfo.firstLink")}
				>
					{t("webhookInfo.firstLinkText")}
					<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
				</Link>
				<Link
					className="group inline-flex items-center gap-2.5 pl-1 text-green-800"
					target="_blank"
					to={t("webhookInfo.secondLink")}
				>
					{t("webhookInfo.secondLinkText")}
					<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
				</Link>
			</div>
			<div className="flex flex-col gap-2">
				<Input
					aria-label={t("placeholders.filter")}
					className={webhookClassName}
					label={t("placeholders.filter")}
					{...register("filter")}
					name="filter"
					value={watchedFilter}
				/>

				<Link
					className="group mt-2 inline-flex items-center gap-2.5 pl-1 text-green-800"
					target="_blank"
					to={t("webhookInfo.thirdLink")}
				>
					{t("webhookInfo.thirdLinkText")}
					<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
				</Link>
			</div>
			<div className="flex flex-row gap-4">
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
		</>
	);
};

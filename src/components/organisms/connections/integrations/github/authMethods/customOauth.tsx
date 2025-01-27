import React from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, ErrorMessage, Input, Spinner, Textarea } from "@components/atoms";

export const CustomOauthForm = ({
	control,
	errors,
	isLoading,
	register,
}: {
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	register: UseFormRegister<{ [x: string]: any }>;
}) => {
	const { t } = useTranslation("integrations");

	const clientId = useWatch({ control, name: "client_id" });
	const clientSecret = useWatch({ control, name: "client_secret" });
	const appId = useWatch({ control, name: "app_id" });
	const webhookSecret = useWatch({ control, name: "webhook_secret" });
	const enterpriseUrl = useWatch({ control, name: "enterprise_url" });
	const privateKey = useWatch({ control, name: "private_key" });

	return (
		<>
			<div className="relative">
				<Input
					{...register("client_id")}
					aria-label={t("github.placeholders.clientId")}
					isError={!!errors.client_id}
					isRequired
					label={t("github.placeholders.clientId")}
					value={clientId}
				/>
				<ErrorMessage>{errors.client_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("client_secret")}
					aria-label={t("github.placeholders.clientSecret")}
					isError={!!errors.client_secret}
					isRequired
					label={t("github.placeholders.clientSecret")}
					value={clientSecret}
				/>
				<ErrorMessage>{errors.client_secret?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("app_id")}
					aria-label={t("github.placeholders.appId")}
					isError={!!errors.app_id}
					isRequired
					label={t("github.placeholders.appId")}
					value={appId}
				/>
				<ErrorMessage>{errors.app_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("webhook_secret")}
					aria-label={t("github.placeholders.webhookSercet")}
					isError={!!errors.webhook_secret}
					isRequired
					label={t("github.placeholders.webhookSercet")}
					value={webhookSecret}
				/>
				<ErrorMessage>{errors.webhook_secret?.message as string}</ErrorMessage>
			</div>
			<Input
				{...register("enterprise_url")}
				aria-label={t("github.placeholders.enterpriseUrl")}
				label={t("github.placeholders.enterpriseUrl")}
				value={enterpriseUrl}
			/>
			<div className="relative">
				<Textarea
					rows={5}
					{...register("private_key")}
					aria-label={t("github.placeholders.privateKey")}
					isError={!!errors.private_key}
					isRequired
					label={t("github.placeholders.privateKey")}
					value={privateKey}
				/>

				<ErrorMessage>{errors.private_key?.message as string}</ErrorMessage>
			</div>

			<Button
				aria-label={t("buttons.startCustomOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : null}
				{t("buttons.startCustomOAuthFlow")}
			</Button>
		</>
	);
};

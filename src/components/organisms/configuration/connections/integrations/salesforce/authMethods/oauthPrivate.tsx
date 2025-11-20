import React from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";

import { ExternalLinkIcon } from "@assets/image/icons";

export const SalesforceOauthPrivateForm = ({
	control,
	errors,
	isLoading,
	register,
}: {
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
}) => {
	const { t } = useTranslation("integrations");

	const clientId = useWatch({ control, name: "client_id" });
	const clientSecret = useWatch({ control, name: "client_secret" });
	const instanceUrl = useWatch({ control, name: "instance_url" });

	return (
		<>
			<div className="relative">
				<Input
					{...register("client_id")}
					aria-label={t("salesforce.placeholders.clientId")}
					isError={!!errors.client_id}
					isRequired
					isSensitive
					label={t("salesforce.placeholders.clientId")}
					value={clientId}
				/>

				<ErrorMessage>{errors.client_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("client_secret")}
					aria-label={t("salesforce.placeholders.clientSecret")}
					isError={!!errors.client_secret}
					isRequired
					isSensitive
					label={t("salesforce.placeholders.clientSecret")}
					value={clientSecret}
				/>

				<ErrorMessage>{errors.client_secret?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("instance_url")}
					aria-label={t("salesforce.placeholders.instanceUrl")}
					isError={!!errors.instance_url}
					isRequired
					label={t("salesforce.placeholders.instanceUrl")}
					placeholder="https://your-instance.salesforce.com"
					value={instanceUrl}
				/>

				<ErrorMessage>{errors.instance_url?.message as string}</ErrorMessage>
			</div>

			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <ExternalLinkIcon className="size-4 fill-white transition" />}
				{t("buttons.startOAuthFlow")}
			</Button>
		</>
	);
};

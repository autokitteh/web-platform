import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { salesforceIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";

export const SalesforceIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const { handleCustomOauth, errors, handleSubmit, isLoading, register } = useConnectionForm(
		salesforceIntegrationSchema,
		"create"
	);

	useEffect(() => {
		if (connectionId) {
			handleCustomOauth(connectionId, Integrations.salesforce, ConnectionAuthType.OauthPrivate);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
			<div className="relative">
				<Input
					{...register("client_id")}
					aria-label={t("salesforce.placeholders.clientId")}
					isError={!!errors.client_id}
					isRequired
					label={t("salesforce.placeholders.clientId")}
				/>

				<ErrorMessage>{errors.client_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("client_secret")}
					aria-label={t("salesforce.placeholders.clientSecret")}
					isError={!!errors.client_secret}
					isRequired
					label={t("salesforce.placeholders.clientSecret")}
				/>

				<ErrorMessage>{errors.client_secret?.message as string}</ErrorMessage>
			</div>

			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : null}
				{t("buttons.startOAuthFlow")}
			</Button>
		</form>
	);
};

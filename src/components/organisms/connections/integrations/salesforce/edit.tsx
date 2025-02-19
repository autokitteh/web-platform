import React, { useEffect, useState } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { integrationVariablesMapping } from "@src/constants";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { setFormValues } from "@src/utilities";
import { salesforceIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";

export const SalesforceIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(true);
	const { connectionId } = useParams();

	const { connectionVariables, control, errors, handleSubmit, isLoading, handleCustomOauth, register, setValue } =
		useConnectionForm(salesforceIntegrationSchema, "edit");

	const clientSecret = useWatch({ control, name: "client_secret" });

	useEffect(() => {
		setFormValues(connectionVariables, integrationVariablesMapping.chatgpt, setValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={handleSubmit(() =>
				handleCustomOauth(connectionId!, Integrations.salesforce, ConnectionAuthType.OauthPrivate)
			)}
		>
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
				<SecretInput
					type="password"
					{...register("client_secret")}
					aria-label={t("salesforce.placeholders.clientSecret")}
					handleInputChange={(newValue) => setValue("client_secret", newValue)}
					handleLockAction={setLockState}
					isError={!!errors.client_secret}
					isLocked={lockState}
					isRequired
					label={t("salesforce.placeholders.clientSecret")}
					value={clientSecret}
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

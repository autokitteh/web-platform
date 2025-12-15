import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { ConnectionAuthType } from "@enums";
import { IntegrationAddFormProps, SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import {
	getAuthMethodsForIntegration,
	getDefaultAuthTypeWithFeatureFlags,
	getFormForAuthMethod,
	getSchemaForAuthMethod,
} from "@src/utilities";
import { jiraIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const JiraIntegrationAddForm = ({ connectionId, triggerParentFormSubmit }: IntegrationAddFormProps) => {
	const { t } = useTranslation("integrations");

	const {
		clearErrors,
		control,
		createConnection,
		errors,
		handleLegacyOAuth,
		handleSubmit,
		isLoading,
		register,
		setValidationSchema,
	} = useConnectionForm(jiraIntegrationSchema, "create");
	const authMethods = getAuthMethodsForIntegration(Integrations.jira);
	const defaultAuthType = getDefaultAuthTypeWithFeatureFlags(Integrations.jira, authMethods);
	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		authMethods.find((m) => m.value === defaultAuthType) || authMethods[0]
	);

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.ApiToken:
				await createConnection(connectionId, ConnectionAuthType.ApiToken, Integrations.jira);
				break;
			case ConnectionAuthType.Oauth:
				await handleLegacyOAuth(connectionId, Integrations.jira);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (!connectionType?.value) {
			return;
		}
		const schema = getSchemaForAuthMethod(Integrations.jira, connectionType.value as ConnectionAuthType);
		if (schema) {
			setValidationSchema(schema);
		}
		clearErrors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent = connectionType?.value
		? getFormForAuthMethod(Integrations.jira, connectionType.value as ConnectionAuthType)
		: null;

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={authMethods}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>
			<form className="mt-6 flex w-full flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
						control={control}
						errors={errors}
						isLoading={isLoading}
						register={register}
					/>
				) : null}
			</form>
		</>
	);
};

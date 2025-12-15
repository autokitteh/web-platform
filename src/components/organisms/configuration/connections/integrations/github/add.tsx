import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { Integrations } from "@enums/components";
import { ConnectionAuthType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { IntegrationAddFormProps, SelectOption } from "@interfaces/components";
import {
	getAuthMethodsForIntegration,
	getDefaultAuthTypeWithFeatureFlags,
	getFormForAuthMethod,
	getSchemaForAuthMethod,
} from "@src/utilities";
import { githubIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const GithubIntegrationAddForm = ({ connectionId, triggerParentFormSubmit }: IntegrationAddFormProps) => {
	const { t } = useTranslation("integrations");

	const {
		control,
		copyToClipboard,
		createConnection,
		errors,
		handleLegacyOAuth,
		handleCustomOauth,
		handleSubmit,
		isLoading,
		register,
		setValidationSchema,
		setValue,
	} = useConnectionForm(githubIntegrationSchema, "create");

	const authMethods = getAuthMethodsForIntegration(Integrations.github);
	const defaultAuthType = getDefaultAuthTypeWithFeatureFlags(Integrations.github, authMethods);

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		authMethods.find((m) => m.value === defaultAuthType) || authMethods[0]
	);

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.Pat:
				await createConnection(connectionId, ConnectionAuthType.Pat, Integrations.github);
				break;
			case ConnectionAuthType.OauthDefault:
				await handleLegacyOAuth(connectionId, Integrations.github);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(connectionId, Integrations.github, ConnectionAuthType.OauthPrivate);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (!connectionType?.value) {
			return;
		}
		const schema = getSchemaForAuthMethod(Integrations.github, connectionType.value as ConnectionAuthType);
		if (schema) {
			setValidationSchema(schema);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent = connectionType?.value
		? getFormForAuthMethod(Integrations.github, connectionType.value as ConnectionAuthType)
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
			<form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
						control={control}
						copyToClipboard={copyToClipboard}
						errors={errors}
						isLoading={isLoading}
						mode="create"
						register={register}
						setValue={setValue}
					/>
				) : null}
			</form>
		</>
	);
};

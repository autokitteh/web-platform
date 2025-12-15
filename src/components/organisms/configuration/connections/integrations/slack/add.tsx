import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { ConnectionAuthType } from "@enums";
import { IntegrationAddFormProps, SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import {
	getAuthMethodsForIntegration,
	getAuthMethodsForLegacyConnection,
	getDefaultAuthTypeWithFeatureFlags,
	getFormForAuthMethod,
	getSchemaForAuthMethod,
} from "@src/utilities";
import { slackIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const SlackIntegrationAddForm = ({ connectionId, triggerParentFormSubmit }: IntegrationAddFormProps) => {
	const { t } = useTranslation("integrations");

	const {
		control,
		handleCustomOauth,
		createConnection,
		errors,
		handleOAuth,
		handleSubmit,
		isLoading,
		register,
		setValidationSchema,
	} = useConnectionForm(slackIntegrationSchema, "create");

	const authMethods = getAuthMethodsForIntegration(Integrations.slack);
	const defaultAuthType = getDefaultAuthTypeWithFeatureFlags(Integrations.slack, authMethods);

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		authMethods.find((m) => m.value === defaultAuthType) || authMethods[0]
	);
	const [slackOptions, setSlackOptions] = useState<SelectOption[]>(authMethods);

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.Socket:
				await createConnection(connectionId, ConnectionAuthType.Socket, Integrations.slack);
				break;
			case ConnectionAuthType.OauthDefault:
				await handleOAuth(connectionId, Integrations.slack);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(connectionId, Integrations.slack, ConnectionAuthType.OauthPrivate);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (!connectionType?.value) {
			return;
		}
		const legacyConnectionType = connectionType?.value === ConnectionAuthType.Oauth;
		const schema = getSchemaForAuthMethod(Integrations.slack, connectionType.value as ConnectionAuthType);
		if (schema) {
			setValidationSchema(schema);
		}

		if (legacyConnectionType) {
			setSlackOptions(getAuthMethodsForLegacyConnection(Integrations.slack));
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
		? getFormForAuthMethod(Integrations.slack, connectionType.value as ConnectionAuthType)
		: null;

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={slackOptions}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>
			<form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
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

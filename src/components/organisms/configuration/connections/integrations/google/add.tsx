import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { ConnectionAuthType } from "@enums";
import { IntegrationAddFormProps, SelectOption } from "@interfaces/components";
import { Integrations, defaultGoogleConnectionName, isGoogleIntegration } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import {
	getAuthMethodsForIntegration,
	getDefaultAuthTypeWithFeatureFlags,
	getFormForAuthMethod,
	getSchemaForAuthMethod,
} from "@src/utilities";
import { googleJsonIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const GoogleIntegrationAddForm = ({ connectionId, triggerParentFormSubmit, type }: IntegrationAddFormProps) => {
	const { t } = useTranslation("integrations");

	const authMethods = getAuthMethodsForIntegration(Integrations.gmail);

	const {
		createConnection,
		errors,
		handleCustomOauth,
		handleSubmit,
		isLoading,
		register,
		reset,
		setValidationSchema,
		setValue,
	} = useConnectionForm(googleJsonIntegrationSchema, "create");

	const integrationKeyFromType = Object.entries(Integrations).find(([, value]) => value === type)?.[0] as
		| keyof typeof Integrations
		| undefined;
	const defaultAuthType = getDefaultAuthTypeWithFeatureFlags(
		(integrationKeyFromType as Integrations) || Integrations.gmail,
		authMethods
	);

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		authMethods.find((m) => m.value === defaultAuthType) || authMethods[0]
	);
	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.Json:
				await createConnection(connectionId, ConnectionAuthType.Json, defaultGoogleConnectionName);
				break;
			case ConnectionAuthType.Oauth:
				await handleCustomOauth(connectionId, defaultGoogleConnectionName);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (!connectionType?.value) {
			return;
		}

		if (connectionType.value === ConnectionAuthType.Oauth && isGoogleIntegration(type as Integrations)) {
			setValue("auth_type", ConnectionAuthType.Oauth);
			setValue("auth_scopes", type);
		} else {
			setValue("auth_type", ConnectionAuthType.Json);
		}
		const schema = getSchemaForAuthMethod(Integrations.gmail, connectionType.value as ConnectionAuthType);
		if (schema) {
			setValidationSchema(schema);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType, type]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	useEffect(() => {
		reset({ json: "", auth_scopes: type as keyof typeof Integrations });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [type]);

	const ConnectionTypeComponent = connectionType?.value
		? getFormForAuthMethod((type as Integrations) || Integrations.gmail, connectionType.value as ConnectionAuthType)
		: null;

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				noOptionsLabel={t("placeholders.noConnectionTypesAvailable")}
				onChange={(option) => setConnectionType(option)}
				options={authMethods}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>

			<form className="mt-6 flex w-full flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
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

import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { BackendConnectionAuthType, BackendConnectionUrlAuthType, ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { getIntegrationAuthOptions, getAuthMethodForm } from "@src/constants/connections";
import { Integrations, defaultGoogleConnectionName, isGoogleIntegration } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { getDefaultAuthType } from "@src/utilities";
import { googleJsonIntegrationSchema, googleOauthSchema } from "@validations";

import { Select } from "@components/molecules";

export const GoogleIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	type,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
	type: string;
}) => {
	const { t } = useTranslation("integrations");

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

	const googleAuthOptions = integrationKeyFromType
		? getIntegrationAuthOptions(Integrations[integrationKeyFromType]) || []
		: [];

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		getDefaultAuthType(googleAuthOptions, integrationKeyFromType)
	);
	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.Json:
				await createConnection(
					connectionId,
					ConnectionAuthType.Json,
					BackendConnectionAuthType.json,
					BackendConnectionUrlAuthType.json,
					defaultGoogleConnectionName
				);
				break;
			case ConnectionAuthType.Oauth:
				await handleCustomOauth(
					connectionId,
					defaultGoogleConnectionName,
					ConnectionAuthType.Oauth,
					BackendConnectionUrlAuthType.oauth
				);
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
			setValidationSchema(googleOauthSchema);
			return;
		}
		setValue("auth_type", ConnectionAuthType.Json);
		setValidationSchema(googleJsonIntegrationSchema);

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

	const ConnectionTypeComponent = getAuthMethodForm(
		type as Integrations,
		connectionType?.value as ConnectionAuthType
	);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				noOptionsLabel={t("placeholders.noConnectionTypesAvailable")}
				onChange={(option) => setConnectionType(option)}
				options={googleAuthOptions}
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

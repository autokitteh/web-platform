import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationGoogle } from "@constants/lists";
import { ConnectionAuthType } from "@enums";
import { IntegrationAddFormProps, SelectOption } from "@interfaces/components";
import { Integrations, defaultGoogleConnectionName } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { getDefaultAuthType } from "@src/utilities";
import { googleCalendarIntegrationSchema, googleJsonIntegrationSchema, googleOauthSchema } from "@validations";

import { Select } from "@components/molecules";

export const GoogleCalendarIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	type,
	onSuccess,
	isGlobalConnection,
}: IntegrationAddFormProps) => {
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
	} = useConnectionForm(googleCalendarIntegrationSchema, "create", undefined, onSuccess, isGlobalConnection);

	const integrationKeyFromType = Object.entries(Integrations).find(([, value]) => value === type)?.[0] as
		| keyof typeof Integrations
		| undefined;

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		getDefaultAuthType(selectIntegrationGoogle, integrationKeyFromType)
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

		if (connectionType.value === ConnectionAuthType.Oauth) {
			setValidationSchema(googleOauthSchema);
			setValue("auth_type", ConnectionAuthType.Oauth);

			setValue("auth_scopes", type);

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
		reset({ jsonKey: "", auth_scopes: type as keyof typeof Integrations });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [type]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.calendar]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				noOptionsLabel={t("placeholders.noConnectionTypesAvailable")}
				onChange={(option) => setConnectionType(option)}
				options={selectIntegrationGoogle}
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

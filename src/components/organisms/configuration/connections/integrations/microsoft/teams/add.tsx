import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { integrationsToAuthOptionsMap } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { IntegrationAddFormProps, SelectOption } from "@interfaces/components";
import { formsPerIntegrationsMapping } from "@src/constants/connections/formsPerIntegrationsMapping.constants";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { getDefaultAuthType } from "@src/utilities";
import { legacyOauthSchema, microsoftTeamsIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const MicrosoftTeamsIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	type,
}: IntegrationAddFormProps) => {
	const { t } = useTranslation("integrations");

	const authMethods = integrationsToAuthOptionsMap.microsoft_teams;

	const {
		control,
		handleCustomOauth,
		createConnection,
		errors,
		handleOAuth,
		handleSubmit,
		isLoading,
		register,
		setValue,
		setValidationSchema,
	} = useConnectionForm(microsoftTeamsIntegrationSchema, "create");

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		getDefaultAuthType(authMethods, Integrations.microsoft_teams)
	);

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.OauthDefault:
				await handleOAuth(connectionId, Integrations.microsoft_teams);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(connectionId, Integrations.microsoft_teams, ConnectionAuthType.OauthPrivate);
				break;
			case ConnectionAuthType.DaemonApp:
				await createConnection(connectionId, ConnectionAuthType.DaemonApp, Integrations.microsoft_teams);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (!connectionType?.value) return;
		setValue("auth_scopes", type);
		const authType = connectionType.value as ConnectionAuthType;

		switch (authType) {
			case ConnectionAuthType.OauthDefault:
				setValidationSchema(legacyOauthSchema);
				break;
			case ConnectionAuthType.OauthPrivate:
			case ConnectionAuthType.DaemonApp:
				setValidationSchema(microsoftTeamsIntegrationSchema);
				break;
			default:
				setValidationSchema(microsoftTeamsIntegrationSchema);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType, type]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.microsoft_teams]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={setConnectionType}
				options={authMethods}
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

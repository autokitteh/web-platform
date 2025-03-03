import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { microsoftTeamsIntegrationAuthMethods } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { defaultMicrosoftConnectionName, Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { oauthSchema, microsoftTeamsIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const MicrosoftTeamsIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
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
	} = useConnectionForm(microsoftTeamsIntegrationSchema, "create");

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>();

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.OauthDefault:
				await handleOAuth(connectionId, defaultMicrosoftConnectionName);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(connectionId, defaultMicrosoftConnectionName, ConnectionAuthType.OauthPrivate);
				break;
			case ConnectionAuthType.DaemonApp:
				await createConnection(connectionId, ConnectionAuthType.DaemonApp, defaultMicrosoftConnectionName);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (!connectionType?.value) {
			return;
		}
		switch (connectionType?.value) {
			case ConnectionAuthType.OauthDefault:
				setValidationSchema(oauthSchema);
				return;
			case ConnectionAuthType.OauthPrivate:
				setValidationSchema(microsoftTeamsIntegrationSchema);
				return;
			case ConnectionAuthType.DaemonApp:
				setValidationSchema(microsoftTeamsIntegrationSchema);
		}
		setValidationSchema(microsoftTeamsIntegrationSchema);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.teams]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={microsoftTeamsIntegrationAuthMethods}
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

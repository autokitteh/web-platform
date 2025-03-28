import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { microsoftTeamsIntegrationAuthMethods } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { oauthSchema, microsoftTeamsIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const MicrosoftTeamsIntegrationAddForm = ({
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

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>();

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
				setValidationSchema(oauthSchema);
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

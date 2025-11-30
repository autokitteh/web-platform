import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationJira } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { IntegrationAddFormProps, SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { getDefaultAuthType } from "@src/utilities";
import { jiraIntegrationSchema, legacyOauthSchema } from "@validations";

import { Select } from "@components/molecules";

export const JiraIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	onSuccess,
	isGlobalConnection,
}: IntegrationAddFormProps) => {
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
	} = useConnectionForm(jiraIntegrationSchema, "create", undefined, onSuccess, isGlobalConnection);
	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		getDefaultAuthType(selectIntegrationJira, Integrations.jira)
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
		if (connectionType.value === ConnectionAuthType.Oauth) {
			setValidationSchema(legacyOauthSchema);

			return;
		}
		setValidationSchema(jiraIntegrationSchema);
		clearErrors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.jira]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={selectIntegrationJira}
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

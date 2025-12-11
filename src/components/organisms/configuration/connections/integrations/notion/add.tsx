import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@src/constants/connections/formsPerIntegrationsMapping.constants";
import { notionIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { IntegrationAddFormProps, SelectOption } from "@src/interfaces/components";
import { getDefaultAuthType } from "@src/utilities";
import { notionApiKeyIntegrationSchema, legacyOauthSchema } from "@validations";

import { Select } from "@components/molecules";

export const NotionIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	isGlobalConnection,
}: IntegrationAddFormProps) => {
	const { t } = useTranslation("integrations");
	const {
		control,
		copyToClipboard,
		errors,
		handleOAuth,
		handleSubmit,
		isLoading,
		register,
		setValidationSchema,
		setValue,
		createConnection,
	} = useConnectionForm(legacyOauthSchema, "create", undefined, isGlobalConnection);

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		getDefaultAuthType(notionIntegrationAuthMethods, Integrations.notion)
	);

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.OauthDefault:
				await handleOAuth(connectionId, Integrations.notion);
				break;
			case ConnectionAuthType.ApiKey:
				await createConnection(connectionId, ConnectionAuthType.ApiKey, Integrations.notion);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (!connectionType?.value) {
			return;
		}
		if (connectionType.value === ConnectionAuthType.OauthDefault) {
			setValidationSchema(legacyOauthSchema);

			return;
		}
		if (connectionType.value === ConnectionAuthType.ApiKey) {
			setValidationSchema(notionApiKeyIntegrationSchema);

			return;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.notion]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={notionIntegrationAuthMethods}
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

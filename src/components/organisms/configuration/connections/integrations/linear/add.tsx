import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@src/constants";
import { linearIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { SelectOption } from "@src/interfaces/components";
import {
	linearPrivateAuthIntegrationSchema,
	linearApiKeyIntegrationSchema,
	linearOauthIntegrationSchema,
} from "@validations";

import { Select } from "@components/molecules";

export const LinearIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");
	const {
		control,
		copyToClipboard,
		errors,
		handleCustomOauth,
		handleSubmit,
		isLoading,
		register,
		setValidationSchema,
		setValue,
		createConnection,
		clearErrors,
	} = useConnectionForm(linearPrivateAuthIntegrationSchema, "create");

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>();

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.OauthDefault:
				await handleCustomOauth(connectionId, Integrations.linear, ConnectionAuthType.OauthDefault);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(connectionId, Integrations.linear, ConnectionAuthType.OauthPrivate);
				break;
			case ConnectionAuthType.ApiKey:
				await createConnection(connectionId, ConnectionAuthType.ApiKey, Integrations.linear);
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
			setValidationSchema(linearOauthIntegrationSchema);

			return;
		}
		if (connectionType.value === ConnectionAuthType.OauthPrivate) {
			setValidationSchema(linearPrivateAuthIntegrationSchema);

			return;
		}
		if (connectionType.value === ConnectionAuthType.ApiKey) {
			setValidationSchema(linearApiKeyIntegrationSchema);

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
		formsPerIntegrationsMapping[Integrations.linear]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={linearIntegrationAuthMethods}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>
			<form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
						clearErrors={clearErrors}
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

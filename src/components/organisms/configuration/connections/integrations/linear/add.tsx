import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { getIntegrationAuthOptions, getAuthMethodForm } from "@src/constants/connections";
import { BackendConnectionAuthType, BackendConnectionUrlAuthType, ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { SelectOption } from "@src/interfaces/components";
import { getDefaultAuthType } from "@src/utilities";
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

	const linearAuthOptions = getIntegrationAuthOptions(Integrations.linear) || [];

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		getDefaultAuthType(linearAuthOptions, Integrations.linear)
	);

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.OauthDefault:
				await handleCustomOauth(
					connectionId,
					Integrations.linear,
					ConnectionAuthType.OauthDefault,
					BackendConnectionUrlAuthType.oauthDefault
				);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(
					connectionId,
					Integrations.linear,
					ConnectionAuthType.OauthPrivate,
					BackendConnectionUrlAuthType.oauthPrivate
				);
				break;
			case ConnectionAuthType.ApiKey:
				await createConnection(
					connectionId,
					ConnectionAuthType.ApiKey,
					BackendConnectionAuthType.api_key,
					null,
					Integrations.linear
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

	const ConnectionTypeComponent = getAuthMethodForm(Integrations.linear, connectionType?.value as ConnectionAuthType);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={linearAuthOptions}
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

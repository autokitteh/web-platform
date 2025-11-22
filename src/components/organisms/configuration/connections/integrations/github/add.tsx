import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { Integrations } from "@enums/components";
import { BackendConnectionUrlAuthType, ConnectionAuthType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { SelectOption } from "@interfaces/components";
import { formsPerIntegrationsMapping } from "@src/constants";
import { getIntegrationAuthOptions } from "@src/constants/connections/integrationAuthMethods.constants";
import { getDefaultAuthType } from "@src/utilities";
import { githubIntegrationSchema, githubPrivateAuthIntegrationSchema, legacyOauthSchema } from "@validations";

import { Select } from "@components/molecules";

export const GithubIntegrationAddForm = ({
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
		createConnection,
		errors,
		handleLegacyOAuth,
		handleCustomOauth,
		handleSubmit,
		isLoading,
		register,
		setValidationSchema,
		setValue,
	} = useConnectionForm(githubIntegrationSchema, "create");

	const githubAuthOptions = getIntegrationAuthOptions(Integrations.github) || [];

	const filteredAuthMethods = githubAuthOptions.filter((authMethod) => authMethod.value !== ConnectionAuthType.Oauth);
	const defaultAuthType = getDefaultAuthType(filteredAuthMethods, Integrations.github);

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(defaultAuthType);

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.Pat:
				await createConnection(connectionId, ConnectionAuthType.Pat, null, null, Integrations.github);
				break;
			case ConnectionAuthType.OauthDefault:
				await handleLegacyOAuth(connectionId, Integrations.github, BackendConnectionUrlAuthType.oauthDefault);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(
					connectionId,
					Integrations.github,
					ConnectionAuthType.OauthPrivate,
					BackendConnectionUrlAuthType.oauthPrivate
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
			setValidationSchema(legacyOauthSchema);

			return;
		}
		if (connectionType.value === ConnectionAuthType.OauthPrivate) {
			setValidationSchema(githubPrivateAuthIntegrationSchema);

			return;
		}
		setValidationSchema(githubIntegrationSchema);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.github]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={filteredAuthMethods}
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

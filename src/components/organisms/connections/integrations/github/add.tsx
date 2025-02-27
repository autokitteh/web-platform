import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { githubIntegrationAuthMethods } from "@constants/lists";
import { Integrations } from "@enums/components";
import { ConnectionAuthType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { SelectOption } from "@interfaces/components";
import { formsPerIntegrationsMapping } from "@src/constants";
import { githubIntegrationSchema, githubPrivateAuthIntegrationSchema, oauthSchema } from "@validations";

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

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>();

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.Pat:
				await createConnection(connectionId, ConnectionAuthType.Pat, Integrations.github);
				break;
			case ConnectionAuthType.OauthDefault:
				await handleLegacyOAuth(connectionId, Integrations.github);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(connectionId, Integrations.github, ConnectionAuthType.OauthPrivate);
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
			setValidationSchema(oauthSchema);

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

	//TODO: remove Oauth from the list of auth methods when the migration is complete
	const filteredAuthMethods = githubIntegrationAuthMethods.filter(
		(authMethod) => authMethod.value !== ConnectionAuthType.Oauth
	);

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

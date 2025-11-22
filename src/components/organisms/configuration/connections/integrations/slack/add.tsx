import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { BackendConnectionAuthType, BackendConnectionUrlAuthType, ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import {
	getSlackOptionsForLegacyAuth,
	getIntegrationAuthOptions,
} from "@src/constants/connections/integrationAuthMethods.constants";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { getDefaultAuthType } from "@src/utilities";
import { legacyOauthSchema, slackIntegrationSchema, slackPrivateAuthIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const SlackIntegrationAddForm = ({
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
	} = useConnectionForm(slackIntegrationSchema, "create");

	const slackAuthOptions = getIntegrationAuthOptions(Integrations.slack) || [];

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		getDefaultAuthType(slackAuthOptions, Integrations.slack)
	);
	const [slackOptions, setSlackOptions] = useState<SelectOption[]>(slackAuthOptions);

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.Socket:
				await createConnection(
					connectionId,
					ConnectionAuthType.Socket,
					BackendConnectionAuthType.socket_mode,
					null,
					Integrations.slack
				);
				break;
			case ConnectionAuthType.OauthDefault:
				await handleOAuth(connectionId, Integrations.slack, BackendConnectionUrlAuthType.oauthDefault);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(
					connectionId,
					Integrations.slack,
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
		const legacyConnectionType = connectionType?.value === ConnectionAuthType.Oauth;
		if (connectionType.value === ConnectionAuthType.OauthDefault || legacyConnectionType) {
			setValidationSchema(legacyOauthSchema);

			if (legacyConnectionType) {
				const slackOptionsForLegacyAuth = getSlackOptionsForLegacyAuth() || [];
				setSlackOptions(slackOptionsForLegacyAuth);
			}

			return;
		}
		if (connectionType.value === ConnectionAuthType.OauthPrivate) {
			setValidationSchema(slackPrivateAuthIntegrationSchema);

			return;
		}
		setValidationSchema(slackIntegrationSchema);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.slack]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={slackOptions}
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

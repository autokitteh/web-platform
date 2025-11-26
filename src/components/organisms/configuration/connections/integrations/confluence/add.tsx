import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { BackendConnectionUrlAuthType, ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { getIntegrationAuthOptions, getAuthMethodForm } from "@src/constants/connections";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { getDefaultAuthType } from "@src/utilities";
import { confluenceApiTokenIntegrationSchema, confluencePatIntegrationSchema, legacyOauthSchema } from "@validations";

import { Select } from "@components/molecules";

export const ConfluenceIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
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
	} = useConnectionForm(confluenceApiTokenIntegrationSchema, "create");

	const confluenceAuthOptions = getIntegrationAuthOptions(Integrations.confluence) || [];

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		getDefaultAuthType(confluenceAuthOptions, Integrations.confluence)
	);

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.ApiToken:
				await createConnection(connectionId, ConnectionAuthType.ApiToken, null, null, Integrations.confluence);
				break;
			case ConnectionAuthType.Pat:
				await createConnection(connectionId, ConnectionAuthType.Pat, null, null, Integrations.confluence);
				break;
			case ConnectionAuthType.Oauth:
				await handleLegacyOAuth(connectionId, Integrations.confluence, BackendConnectionUrlAuthType.oauth);
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
		if (connectionType.value === ConnectionAuthType.Pat) {
			setValidationSchema(confluencePatIntegrationSchema);
		} else {
			setValidationSchema(confluenceApiTokenIntegrationSchema);
		}
		clearErrors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent = getAuthMethodForm(
		Integrations.confluence,
		connectionType?.value as ConnectionAuthType
	);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={confluenceAuthOptions}
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

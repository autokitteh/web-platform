import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { ConnectionAuthType } from "@enums";
import { BackendConnectionUrlAuthType } from "@enums/connections";
import { SelectOption } from "@interfaces/components";
import { getIntegrationAuthOptions, getAuthMethodForm } from "@src/constants/connections";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { getDefaultAuthType } from "@src/utilities";
import { asanaOauthIntegrationSchema, asanaPatIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const AsanaIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const {
		clearErrors,
		createConnection,
		errors,
		handleLegacyOAuth,
		handleSubmit,
		isLoading,
		register,
		setValidationSchema,
	} = useConnectionForm(asanaPatIntegrationSchema, "create");

	const asanaAuthOptions = getIntegrationAuthOptions(Integrations.asana) || [];

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		getDefaultAuthType(asanaAuthOptions, Integrations.asana)
	);

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.Pat:
				await createConnection(connectionId, ConnectionAuthType.Pat, null, null, Integrations.asana);
				break;
			case ConnectionAuthType.Oauth:
				await handleLegacyOAuth(connectionId, Integrations.asana, BackendConnectionUrlAuthType.oauth);
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
			setValidationSchema(asanaOauthIntegrationSchema);
		} else {
			setValidationSchema(asanaPatIntegrationSchema);
		}
		clearErrors();
	}, [connectionType, clearErrors, setValidationSchema]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent = getAuthMethodForm(Integrations.asana, connectionType?.value as ConnectionAuthType);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				noOptionsLabel={t("placeholders.noConnectionTypesAvailable")}
				onChange={(option) => setConnectionType(option)}
				options={asanaAuthOptions}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>

			<form className="mt-6 flex w-full flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent errors={errors} isLoading={isLoading} register={register} />
				) : null}
			</form>
		</>
	);
};

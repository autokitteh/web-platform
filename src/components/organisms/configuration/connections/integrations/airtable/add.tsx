import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { getIntegrationAuthOptions, getAuthMethodForm } from "@src/constants/connections";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { getDefaultAuthType } from "@src/utilities";
import { airtableOauthIntegrationSchema, airtablePatIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const AirtableIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const { clearErrors, createConnection, errors, handleSubmit, isLoading, register, setValidationSchema, setValue } =
		useConnectionForm(airtablePatIntegrationSchema, "create");

	const airtableAuthOptions = getIntegrationAuthOptions(Integrations.airtable) || [];

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		getDefaultAuthType(airtableAuthOptions, Integrations.airtable)
	);

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.Pat:
				await createConnection(connectionId, ConnectionAuthType.Pat, null, null, Integrations.airtable);
				break;
			case ConnectionAuthType.OauthDefault:
				await createConnection(
					connectionId,
					ConnectionAuthType.OauthDefault,
					null,
					null,
					Integrations.airtable
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
			setValidationSchema(airtableOauthIntegrationSchema);
			setValue("auth_type", ConnectionAuthType.OauthDefault);
		} else {
			setValidationSchema(airtablePatIntegrationSchema);
			setValue("auth_type", ConnectionAuthType.Pat);
		}
		clearErrors();
	}, [connectionType, clearErrors, setValidationSchema, setValue]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent = getAuthMethodForm(
		Integrations.airtable,
		connectionType?.value as ConnectionAuthType
	);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				noOptionsLabel={t("placeholders.noConnectionTypesAvailable")}
				onChange={(option) => setConnectionType(option)}
				options={airtableAuthOptions}
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

import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationConfluence } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { confluenceIntegrationSchema, oauthSchema } from "@validations";

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
		addConnectionType,
		setAddConnectionType,
		setValidationSchema,
	} = useConnectionForm(confluenceIntegrationSchema, "create");

	const configureConnection = async (connectionId: string) => {
		switch (addConnectionType?.value) {
			case ConnectionAuthType.ApiToken:
				await createConnection(connectionId, ConnectionAuthType.ApiToken, Integrations.confluence);
				break;
			case ConnectionAuthType.Oauth:
				await handleLegacyOAuth(connectionId, Integrations.confluence);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (!addConnectionType?.value) {
			return;
		}
		if (addConnectionType.value === ConnectionAuthType.Oauth) {
			setValidationSchema(oauthSchema);

			return;
		}
		setValidationSchema(confluenceIntegrationSchema);
		clearErrors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addConnectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.confluence]?.[addConnectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={setAddConnectionType}
				options={selectIntegrationConfluence}
				placeholder={t("placeholders.selectConnectionType")}
				value={addConnectionType}
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

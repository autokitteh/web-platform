import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationHttp } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { httpBasicIntegrationSchema, httpBearerIntegrationSchema, oauthSchema } from "@validations";

import { Select } from "@components/molecules";

export const HttpIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");
	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>();

	const { createConnection, errors, handleOAuth, handleSubmit, isLoading, register, setValidationSchema, setValue } =
		useConnectionForm({ basic_username: "", basic_password: "", bearer_access_token: "" }, oauthSchema, "create");

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.Oauth:
				return await handleOAuth(connectionId, Integrations.http);
			case ConnectionAuthType.Basic:
				await createConnection(connectionId, ConnectionAuthType.Basic, Integrations.http);
				break;
			case ConnectionAuthType.Bearer:
				await createConnection(connectionId, ConnectionAuthType.Bearer, Integrations.http);
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
			setValidationSchema(oauthSchema);

			return;
		}
		if (connectionType?.value === ConnectionAuthType.Basic) {
			setValidationSchema(httpBasicIntegrationSchema);

			return;
		}
		if (connectionType?.value === ConnectionAuthType.Bearer) {
			setValidationSchema(httpBearerIntegrationSchema);

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
		formsPerIntegrationsMapping[Integrations.http]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={selectIntegrationHttp}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>
			<form className="flex flex-col gap-4" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
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

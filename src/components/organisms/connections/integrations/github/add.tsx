import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { githubIntegrationAuthMethods } from "@constants/lists";
import { Integrations } from "@enums/components";
import { ConnectionAuthType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { SelectOption } from "@interfaces/components";
import { formsPerIntegrationsMapping } from "@src/constants";
import { githubIntegrationSchema, oauthSchema } from "@validations";

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
		copyToClipboard,
		createConnection,
		errors,
		handleOAuth,
		handleSubmit,
		isLoading,
		register,
		setValidationSchema,
		setValue,
	} = useConnectionForm({ pat: "", secret: "" }, githubIntegrationSchema, "create");

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>();

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.Pat:
				await createConnection(connectionId, ConnectionAuthType.Pat, Integrations.github);
				break;
			case ConnectionAuthType.Oauth:
				await handleOAuth(connectionId, Integrations.github);
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
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={githubIntegrationAuthMethods}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>
			<form className="mt-6 flex items-start gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				<div className="flex w-full flex-col gap-6">
					{ConnectionTypeComponent ? (
						<ConnectionTypeComponent
							copyToClipboard={copyToClipboard}
							errors={errors}
							isLoading={isLoading}
							mode="create"
							register={register}
							setValue={setValue}
						/>
					) : null}
				</div>
			</form>
		</>
	);
};

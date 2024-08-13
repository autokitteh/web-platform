import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { githubIntegrationAuthMethods } from "@constants/lists";
import { Integrations } from "@enums/components";
import { ConnectionAuthType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { SelectOption } from "@interfaces/components";
import { formsPerIntegrationsMapping } from "@src/constants";
import { isComponentDefined } from "@src/utilities";
import { githubIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const GithubIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const { copyToClipboard, errors, handleConnection, handleOAuth, isLoading, register, setValue, watch } =
		useConnectionForm({ pat: "", secret: "" }, githubIntegrationSchema, "create");

	const selectedConnectionType = watch("selectedConnectionType");

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setValue("selectedConnectionType", option as SelectOption);
	};

	const configureConnection = async (connectionId: string) => {
		switch (selectedConnectionType?.value) {
			case ConnectionAuthType.Pat:
				await handleConnection(connectionId, ConnectionAuthType.Pat, Integrations.github);
				break;
			case ConnectionAuthType.Oauth:
				await handleOAuth(connectionId, Integrations.github);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.github]?.[selectedConnectionType?.value as ConnectionAuthType];

	return (
		<form className="flex items-start gap-10" onSubmit={triggerParentFormSubmit}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					label={t("placeholders.connectionType")}
					onChange={selectConnectionType}
					options={githubIntegrationAuthMethods}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{isComponentDefined(ConnectionTypeComponent) ? (
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
	);
};

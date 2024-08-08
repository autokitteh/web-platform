import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { githubIntegrationAuthMethods } from "@constants/lists";
import { Integrations } from "@enums/components";
import { ConnectionAuthType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { SelectOption } from "@interfaces/components";
import { githubIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";
import { OauthForm, PatForm } from "@components/organisms/connections/integrations/github/authMethods";

export const GithubIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const { copyToClipboard, errors, getValues, handleConnection, handleOAuth, isLoading, register, setValue, watch } =
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
	const renderConnectionType = () => {
		switch (selectedConnectionType?.value) {
			case ConnectionAuthType.Pat:
				return (
					<PatForm
						copyToClipboard={copyToClipboard}
						errors={errors}
						getValues={getValues}
						isLoading={isLoading}
						mode="create"
						register={register}
						setValue={setValue}
					/>
				);
			case ConnectionAuthType.Oauth:
				return <OauthForm />;
			default:
				return null;
		}
	};

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

				{renderConnectionType()}
			</div>
		</form>
	);
};

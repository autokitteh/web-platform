import React from "react";

import { useTranslation } from "react-i18next";

import { githubIntegrationAuthMethods } from "@constants/lists";
import { ConnectionAuthType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { githubIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";
import { OauthForm, PatForm } from "@components/organisms/connections/integrations/github/authMethods";

export const GithubIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");

	const {
		connectionType,
		connectionVariables,
		copyToClipboard,
		errors,
		handleSubmit,
		isLoading,
		onSubmitEdit,
		register,
		setValue,
	} = useConnectionForm(
		{ pat: "", secret: "", patIsSecret: true, secretIsSecret: true, webhook: "" },
		githubIntegrationSchema,
		"edit"
	);

	let patWebhookKey: string | undefined;
	if (connectionType === ConnectionAuthType.Pat && connectionVariables) {
		patWebhookKey = connectionVariables.find((variable) => variable.name === "pat_key")?.value;
	}

	const renderConnectionFields = () => {
		switch (connectionType) {
			case ConnectionAuthType.Pat:
				return (
					<PatForm
						copyToClipboard={copyToClipboard}
						errors={errors}
						isLoading={isLoading}
						mode="edit"
						patWebhookKey={patWebhookKey}
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

	const selectConnectionTypeValue = githubIntegrationAuthMethods.find((method) => method.value === connectionType);

	return (
		<form className="flex items-start gap-10" id="connectionForm" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					disabled
					onChange={() => {}}
					options={githubIntegrationAuthMethods}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectConnectionTypeValue}
				/>

				{renderConnectionFields()}
			</div>
		</form>
	);
};

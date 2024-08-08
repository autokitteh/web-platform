import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { githubIntegrationAuthMethods } from "@constants/lists";
import { Integrations } from "@enums/components";
import { ConnectionAuthType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { SelectOption } from "@interfaces/components";
import { githubIntegrationSchema } from "@validations";

import { Select } from "@components/atoms";
import { OauthForm, PatForm } from "@components/organisms/connections/integrations/github/authMethods";

export const GithubIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const { connectionId, projectId } = useParams();
	const navigate = useNavigate();

	const onSuccess = () => {
		navigate(`/projects/${projectId}/connections`);
	};

	const {
		copyToClipboard,
		errors,
		getValues,
		handleOAuth,
		handleSubmit,
		isLoading,
		onSubmit,
		register,
		setValue,
		watch,
	} = useConnectionForm(
		{ pat: "", secret: "", patIsSecret: true, secretIsSecret: true, webhook: "" },
		githubIntegrationSchema,
		"edit",
		onSuccess
	);

	const selectedConnectionType = watch("selectedConnectionType");

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setValue("selectedConnectionType", option as SelectOption);
	};

	const initOAuth = () => {
		handleOAuth(connectionId!, Integrations.github);
	};

	const renderConnectionFields = () => {
		switch (selectedConnectionType?.value) {
			case ConnectionAuthType.Pat:
				return (
					<PatForm
						copyToClipboard={copyToClipboard}
						errors={errors}
						getValues={getValues}
						isLoading={isLoading}
						mode="edit"
						register={register}
						setValue={setValue}
					/>
				);
			case ConnectionAuthType.Oauth:
				return <OauthForm triggerParentFormSubmit={initOAuth} />;
			default:
				return null;
		}
	};

	return (
		<form className="flex items-start gap-10" id="connectionForm" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					onChange={selectConnectionType}
					options={githubIntegrationAuthMethods}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{renderConnectionFields()}
			</div>
		</form>
	);
};

import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { githubIntegrationAuthMethods } from "@constants/lists";
import { ConnectionFormIds } from "@enums/components";
import { GithubConnectionType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { SelectOption } from "@interfaces/components";
import { githubIntegrationSchema } from "@validations";

import { Select } from "@components/atoms";
import { OauthForm, PatForm } from "@components/organisms/connections/integrations/github/authMethods";

export const GithubIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const { connectionId, projectId } = useParams();

	const {
		copyToClipboard,
		errors,
		handleGithubOAuth,
		handleSubmit,
		isLoading,
		onSubmit,
		register,
		setValue,
		watch,
		webhookUrl,
	} = useConnectionForm(
		{ pat: "", webhookSecret: "", patIsSecret: true, webhookSecretIsSecret: true },
		githubIntegrationSchema,
		"update"
	);

	const navigate = useNavigate();

	const selectedConnectionType = watch("selectedConnectionType");

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setValue("selectedConnectionType", option as SelectOption);
	};

	const initOAuth = () => {
		handleGithubOAuth(connectionId!);
		navigate(`/projects/${projectId}/connections`);
	};

	return (
		<form className="flex items-start gap-10" id={ConnectionFormIds.createGithub} onSubmit={handleSubmit(onSubmit)}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					onChange={selectConnectionType}
					options={githubIntegrationAuthMethods}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{selectedConnectionType?.value === GithubConnectionType.Pat ? (
					<PatForm
						copyToClipboard={copyToClipboard}
						errors={errors}
						isLoading={isLoading}
						register={register}
						webhookUrl={webhookUrl}
					/>
				) : null}

				{selectedConnectionType?.value === GithubConnectionType.Oauth ? (
					<OauthForm triggerParentFormSubmit={initOAuth} />
				) : null}
			</div>
		</form>
	);
};

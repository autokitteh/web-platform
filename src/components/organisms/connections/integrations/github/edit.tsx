import React from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { OauthForm } from "./authMethods/add/oauth";
import { EditPatForm } from "./authMethods/edit/pat";
import { githubIntegrationAuthMethods } from "@constants/lists";
import { ConnectionFormIds } from "@enums/components";
import { GithubConnectionType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { SelectOption } from "@interfaces/components";
import { githubIntegrationSchema } from "@validations";

import { Select } from "@components/atoms";

export const GithubIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const { connectionId, projectId } = useParams();

	const {
		control,
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

	const pat = useWatch({ control, name: "pat" });
	const patIsSecret = useWatch({ control, name: "patIsSecret" });
	const webhookSecret = useWatch({ control, name: "webhookSecret" });
	const webhookSecretIsSecret = useWatch({ control, name: "webhookSecretIsSecret" });

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
					<EditPatForm
						copyToClipboard={copyToClipboard}
						errors={errors}
						isLoading={isLoading}
						pat={pat}
						patIsSecret={patIsSecret}
						register={register}
						setValue={setValue}
						webhookSecret={webhookSecret}
						webhookSecretIsSecret={webhookSecretIsSecret}
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

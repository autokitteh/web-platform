import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { githubIntegrationAuthMethods } from "@constants/lists";
import { ConnectionFormIds } from "@enums/components";
import { GithubConnectionType } from "@enums/connections";
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
	const { projectId } = useParams();
	const navigate = useNavigate();

	const {
		copyToClipboard,
		errors,
		handleGithubOAuth,
		handlePatConnection,
		handleSubmit,
		isLoading,
		register,
		setValue,
		watch,
		webhookUrl,
	} = useConnectionForm({ pat: "", webhookSecret: "" }, githubIntegrationSchema, "create");

	const selectedConnectionType = watch("selectedConnectionType");

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setValue("selectedConnectionType", option as SelectOption);
	};

	const configureConnection = async (connectionId: string) => {
		switch (selectedConnectionType?.value) {
			case GithubConnectionType.Pat:
				{
					const connectionCreationResult = await handlePatConnection(connectionId);
					if (connectionCreationResult) {
						navigate(`/projects/${projectId}/connections`);
					}
				}
				break;
			case GithubConnectionType.Oauth:
				await handleGithubOAuth(connectionId);
				navigate(`/projects/${projectId}/connections`);
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

	const onSubmit = () => {
		triggerParentFormSubmit();
	};

	return (
		<form className="flex items-start gap-10" id={ConnectionFormIds.createGithub} onSubmit={handleSubmit(onSubmit)}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					label={t("placeholders.connectionType")}
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
					<OauthForm triggerParentFormSubmit={triggerParentFormSubmit} />
				) : null}
			</div>
		</form>
	);
};

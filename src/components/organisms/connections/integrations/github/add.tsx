import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { githubIntegrationAuthMethods } from "@constants/lists";
import { Integrations } from "@enums/components";
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

	const onSuccess = () => {
		navigate(`/projects/${projectId}/connections`);
	};

	const {
		copyToClipboard,
		errors,
		getValues,
		handleConnection,
		handleOAuth,
		handleSubmit,
		isLoading,
		register,
		setValue,
		watch,
	} = useConnectionForm({ pat: "", secret: "" }, githubIntegrationSchema, "create", onSuccess);

	const selectedConnectionType = watch("selectedConnectionType");

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setValue("selectedConnectionType", option as SelectOption);
	};

	const configureConnection = async (connectionId: string) => {
		switch (selectedConnectionType?.value) {
			case GithubConnectionType.Pat:
				{
					await handleConnection(connectionId, Integrations.github, GithubConnectionType.Pat);
				}
				break;
			case GithubConnectionType.Oauth:
				await handleOAuth(connectionId, Integrations.github);
				onSuccess();
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

	const renderConnectionFields = () => {
		switch (selectedConnectionType?.value) {
			case GithubConnectionType.Pat:
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
			case GithubConnectionType.Oauth:
				return <OauthForm triggerParentFormSubmit={triggerParentFormSubmit} />;
			default:
				return null;
		}
	};

	return (
		<form className="flex items-start gap-10" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					label={t("placeholders.connectionType")}
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

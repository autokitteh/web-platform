import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { namespaces } from "@constants";
import { selectIntegrationJira } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { HttpService, LoggerService } from "@services";
import { getApiBaseUrl } from "@src/utilities";
import { jiraIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Select } from "@components/molecules";
import { ApiTokenJiraForm, OauthJiraForm } from "@components/organisms/connections/integrations/jira";

export const JiraIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const { projectId } = useParams();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const [selectedConnectionType, setSelectedConnectionType] = useState<SingleValue<SelectOption>>();
	const [isLoading, setIsLoading] = useState(false);

	const methods = useForm({
		resolver: zodResolver(jiraIntegrationSchema),
		defaultValues: {
			baseUrl: "",
			token: "",
			email: "",
		},
	});

	const { getValues, handleSubmit } = methods;

	const createConnection = async () => {
		setIsLoading(true);
		const { baseUrl, email, token } = getValues();
		try {
			await HttpService.post(`/jira/save?cid=${connectionId}&origin=web`, {
				base_url: baseUrl,
				token,
				email,
			});
			const successMessage = t("connectionCreatedSuccessfully");
			addToast({
				id: Date.now().toString(),
				message: successMessage,
				type: "success",
			});
			LoggerService.info(namespaces.connectionService, successMessage);
			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			const errorMessage = error.response?.data || tErrors("errorCreatingNewConnection");
			addToast({
				id: Date.now().toString(),
				message: errorMessage,
				type: "error",
			});
			LoggerService.error(
				namespaces.connectionService,
				`${tErrors("errorCreatingNewConnectionExtended", { error: errorMessage })}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleJiraOAuth = async () => {
		try {
			const apiBaseUrl = getApiBaseUrl();

			window.open(`${apiBaseUrl}/oauth/start/jira?cid=${connectionId}&origin=web`, "_blank");
			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("errorCreatingNewConnection"),
				type: "error",
			});
			LoggerService.error(
				namespaces.connectionService,
				`${tErrors("errorCreatingNewConnectionExtended", { error: (error as Error).message })}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!connectionId) return;

		switch (selectedConnectionType?.value) {
			case ConnectionAuthType.ApiToken:
				createConnection();
				break;
			case ConnectionAuthType.Oauth:
				handleJiraOAuth();
				break;
			default:
				break;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const renderConnectionFields = () => {
		switch (selectedConnectionType?.value) {
			case ConnectionAuthType.ApiToken:
				return <ApiTokenJiraForm isLoading={isLoading} />;
			case ConnectionAuthType.Oauth:
				return <OauthJiraForm triggerParentFormSubmit={triggerParentFormSubmit} />;
			default:
				return null;
		}
	};

	const onSubmit = () => {
		if (connectionId) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("connectionExists"),
				type: "error",
			});

			LoggerService.error(
				namespaces.connectionService,
				`${tErrors("connectionExistsExtended", { connectionId })}`
			);

			return;
		}

		triggerParentFormSubmit();
	};

	return (
		<FormProvider {...methods}>
			<form className="flex w-full flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					label={t("placeholders.connectionType")}
					onChange={setSelectedConnectionType}
					options={selectIntegrationJira}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{renderConnectionFields()}
			</form>
		</FormProvider>
	);
};

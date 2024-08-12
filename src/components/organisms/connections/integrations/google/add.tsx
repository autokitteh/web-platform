import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { apiBaseUrl, namespaces } from "@constants";
import { selectIntegrationGoogle } from "@constants/lists";
import { GoogleConnectionType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { HttpService, LoggerService } from "@services";
import { googleIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Select } from "@components/molecules";
import { JsonKeyGoogleForm, OauthGoogleForm } from "@components/organisms/connections/integrations/google";

export const GoogleIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	type,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
	type: string;
}) => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const [selectedConnectionType, setSelectedConnectionType] = useState<SelectOption>();
	const { projectId } = useParams();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

	const methods = useForm({
		defaultValues: {
			jsonKey: "",
		},
		resolver: zodResolver(googleIntegrationSchema),
	});
	const { getValues, handleSubmit, reset } = methods;

	const createConnection = async () => {
		setIsLoading(true);
		const { jsonKey } = getValues();

		try {
			await HttpService.post(`/google/save?cid=${connectionId}&origin=web`, {
				jsonKey,
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

	const handleGoogleOAuth = async () => {
		try {
			window.open(`${apiBaseUrl}/oauth/start/google?cid=${connectionId}&origin=web`, "_blank");
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

	const selectConnectionType = (option?: SingleValue<SelectOption>) => {
		setSelectedConnectionType(option as SelectOption);
	};

	useEffect(() => {
		switch (selectedConnectionType?.value) {
			case GoogleConnectionType.ServiceAccount:
				createConnection();
				break;
			case GoogleConnectionType.Oauth:
				handleGoogleOAuth();
				break;
			default:
				break;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	useEffect(() => {
		selectConnectionType();
		reset({ jsonKey: "" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [type]);

	const renderConnectionFields = () => {
		switch (selectedConnectionType?.value) {
			case GoogleConnectionType.ServiceAccount:
				return <JsonKeyGoogleForm isLoading={isLoading} />;
			case GoogleConnectionType.Oauth:
				return <OauthGoogleForm triggerParentFormSubmit={triggerParentFormSubmit} />;
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
					noOptionsLabel={t("placeholders.noConnectionTypesAvailable")}
					onChange={selectConnectionType}
					options={selectIntegrationGoogle}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{renderConnectionFields()}
			</form>
		</FormProvider>
	);
};

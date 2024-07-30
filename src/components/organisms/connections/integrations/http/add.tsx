import React, { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { namespaces } from "@constants";
import { selectIntegrationHttp } from "@constants/lists/connections";
import { HttpConnectionType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { HttpService, LoggerService } from "@services";
import { httpBasicIntegrationSchema, httpBearerIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Button, Select } from "@components/atoms";
import { HttpBasicForm, HttpBearerForm } from "@components/organisms/connections/integrations/http";

export const HttpIntegrationAddForm = ({
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

	const formSchema = useMemo(() => {
		if (selectedConnectionType?.value === HttpConnectionType.Basic) return httpBasicIntegrationSchema;
		if (selectedConnectionType?.value === HttpConnectionType.Bearer) return httpBearerIntegrationSchema;
	}, [selectedConnectionType]);

	const methods = useForm({
		resolver: formSchema ? zodResolver(formSchema) : undefined,
		defaultValues: {
			username: "",
			password: "",
			token: "",
		},
	});

	const { getValues, handleSubmit } = methods;

	const requestPayload = useMemo(() => {
		const { password, token, username } = getValues();
		if (selectedConnectionType?.value === HttpConnectionType.Basic) {
			return {
				basic_username: username,
				basic_password: password,
			};
		}
		if (selectedConnectionType?.value === HttpConnectionType.Bearer) {
			return {
				bearer_access_token: token,
			};
		}
	}, [getValues, selectedConnectionType]);

	const createConnection = async () => {
		setIsLoading(true);

		try {
			await HttpService.post("/i/http/save?cid=${connectionId}&origin=web", requestPayload);
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

	useEffect(() => {
		if (!connectionId) return;
		switch (selectedConnectionType?.value) {
			case HttpConnectionType.NoAuth:
				navigate(`/projects/${projectId}/connections`);
				break;
			default:
				createConnection();
				break;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const renderNoAuth = () => (
		<Button
			aria-label={t("buttons.saveConnection")}
			className="ml-auto w-fit bg-white px-3 font-medium hover:bg-gray-500 hover:text-white"
			disabled={isLoading}
			onClick={triggerParentFormSubmit}
		>
			{t("buttons.saveConnection")}
		</Button>
	);

	const renderConnectionFields = () => {
		switch (selectedConnectionType?.value) {
			case HttpConnectionType.NoAuth:
				return renderNoAuth();
			case HttpConnectionType.Basic:
				return <HttpBasicForm isLoading={isLoading} />;
			case HttpConnectionType.Bearer:
				return <HttpBearerForm isLoading={isLoading} />;
			default:
				return null;
		}
	};

	const onSubmit = () => {
		if (connectionId) {
			addToast({ id: Date.now().toString(), message: tErrors("connectionExists"), type: "error" });
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
			<form className="flex items-start gap-10" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex w-full flex-col gap-6">
					<Select
						aria-label={t("placeholders.selectConnectionType")}
						onChange={setSelectedConnectionType}
						options={selectIntegrationHttp}
						placeholder={t("placeholders.selectConnectionType")}
						value={selectedConnectionType}
					/>

					{renderConnectionFields()}
				</div>
			</form>
		</FormProvider>
	);
};

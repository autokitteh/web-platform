import React, { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { namespaces } from "@constants";
import { selectIntegrationTwilio } from "@constants/lists/connections";
import { TwilioConnectionType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { HttpService, LoggerService } from "@services";
import { twilioApiKeyIntegrationSchema, twilioTokenIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Select } from "@components/atoms";
import { ApiKeyTwilioForm, AuthTokenTwilioForm } from "@components/organisms/connections/integrations/twilio";

export const TwilioIntegrationAddForm = ({
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
	const [selectedConnectionType, setSelectedConnectionType] = useState<SelectOption>();
	const [isLoading, setIsLoading] = useState(false);

	const formSchema = useMemo(() => {
		if (selectedConnectionType?.value === TwilioConnectionType.AuthToken) return twilioTokenIntegrationSchema;
		if (selectedConnectionType?.value === TwilioConnectionType.ApiKey) return twilioApiKeyIntegrationSchema;
	}, [selectedConnectionType]);

	const methods = useForm({
		resolver: formSchema ? zodResolver(formSchema) : undefined,
		defaultValues: {
			sid: "",
			token: "",
			key: "",
			secret: "",
		},
	});

	const { getValues, handleSubmit } = methods;

	const requestPayload = useMemo(() => {
		const { key, secret, sid, token } = getValues();
		if (selectedConnectionType?.value === TwilioConnectionType.AuthToken) {
			return {
				account_sid: sid,
				auth_token: token,
			};
		}
		if (selectedConnectionType?.value === TwilioConnectionType.ApiKey) {
			return {
				account_sid: sid,
				api_key: key,
				api_secret: secret,
			};
		}
	}, [getValues, selectedConnectionType]);

	const createConnection = async () => {
		setIsLoading(true);

		try {
			await HttpService.post(`/twilio/save?cid=${connectionId}&origin=web`, requestPayload);
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
		if (connectionId) {
			createConnection();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setSelectedConnectionType(option as SelectOption);
	};

	const renderConnectionFields = () => {
		switch (selectedConnectionType?.value) {
			case TwilioConnectionType.AuthToken:
				return <AuthTokenTwilioForm isLoading={isLoading} />;
			case TwilioConnectionType.ApiKey:
				return <ApiKeyTwilioForm isLoading={isLoading} />;
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
					onChange={selectConnectionType}
					options={selectIntegrationTwilio}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{renderConnectionFields()}
			</form>
		</FormProvider>
	);
};

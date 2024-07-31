import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import randomatic from "randomatic";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ZodSchema } from "zod";

import { apiBaseUrl, namespaces } from "@constants";
import { ConnectionService, HttpService, LoggerService, VariablesService } from "@services";
import { FormMode } from "@src/types/components";

import { useToastStore } from "@store";

export const useConnectionForm = (
	initialValues: DefaultValues<FieldValues> | undefined,
	validationSchema: ZodSchema,
	mode: FormMode
) => {
	const { t: tErrors } = useTranslation("errors");
	const { connectionId: paramConnectionId, projectId } = useParams();
	const addToast = useToastStore((state) => state.addToast);
	const [connectionIntegrationName, setConnectionIntegrationName] = useState<string>();

	const {
		control,
		formState: { errors },
		getValues,
		handleSubmit,
		register,
		setValue,
		watch,
	} = useForm({
		resolver: zodResolver(validationSchema),
		mode: "onChange",
		defaultValues: initialValues,
	});
	const { t } = useTranslation("integrations");

	const [connectionId, setConnectionId] = useState<string | undefined>(paramConnectionId);
	const [isLoading, setIsLoading] = useState(false);
	const [webhookUrl, setWebhookUrl] = useState<string>("");

	const handleError = (errorKey: string, error: any, skipLogger: boolean = false) => {
		const errorMessage = tErrors(errorKey);
		addToast({ id: Date.now().toString(), message: errorMessage, type: "error" });

		if (skipLogger) {
			return;
		}
		LoggerService.error(
			namespaces.connectionService,
			tErrors(`${errorKey}Extended`, { error: error?.response?.data || error.message })
		);
	};

	const handleSuccess = (successKey: string) => {
		const successMessage = t(successKey);
		addToast({ id: Date.now().toString(), message: successMessage, type: "success" });
		LoggerService.info(namespaces.connectionService, successMessage);
	};

	const fetchConnection = async (id: string) => {
		try {
			const { data: connectionResponse, error } = await ConnectionService.get(id);

			if (error) {
				handleError("errorFetchingConnection", error, true);

				return;
			}

			setConnectionIntegrationName(connectionResponse!.integrationName);
			setValue("connectionName", connectionResponse!.name);
			setValue("integration", {
				label: connectionResponse!.integrationName,
				value: connectionResponse!.integrationUniqueName,
			});
		} catch (error) {
			handleError("errorFetchingConnection", error);
		}
	};

	const createNewConnection = async () => {
		try {
			setIsLoading(true);
			const { connectionName, integration } = getValues();
			const { data: responseConnectionId, error } = await ConnectionService.create(
				projectId!,
				integration.value,
				connectionName
			);

			if (error) {
				handleError("errorCreatingNewConnection", error, true);

				return;
			}

			setConnectionId(responseConnectionId);
		} catch (error) {
			handleError("errorCreatingNewConnection", error);
		} finally {
			setIsLoading(false);
		}
	};

	const resetConnectionId = () => {
		setConnectionId(undefined);
		setTimeout(() => setConnectionId(paramConnectionId), 0);
	};

	const handleConnection = async (connectionId: string, integrationName: string): Promise<boolean> => {
		setIsLoading(true);
		const { pat, webhookSecret: secret } = getValues();

		try {
			await HttpService.post(`/${integrationName}/save?cid=${connectionId}&origin=web`, {
				pat,
				secret,
				webhook: webhookUrl,
			});
			handleSuccess("connectionCreatedSuccessfully");

			return true;
		} catch (error) {
			handleError("errorCreatingNewConnection", error);
			setIsLoading(false);

			return false;
		}
	};

	const handleCreateMode = async () => {
		if (!connectionId) {
			await createNewConnection();
		} else {
			resetConnectionId();
		}
	};

	const onSubmit = async () => {
		if (mode === "create") {
			await handleCreateMode();
		} else {
			await handleConnection(connectionId!, connectionIntegrationName!);
		}
	};

	const handleOAuth = async (oauthConnectionId: string, integrationName: string) => {
		try {
			window.open(`${apiBaseUrl}/oauth/start/${integrationName}?cid=${oauthConnectionId}&origin=web`, "_blank");
		} catch (error) {
			handleError("errorCreatingNewConnection", error);
		} finally {
			setIsLoading(false);
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			addToast({ id: Date.now().toString(), message: t("copySuccess"), type: "success" });
		} catch (error) {
			addToast({ id: Date.now().toString(), message: t("copyFailure"), type: "error" });
		}
	};

	const fetchVariables = async (id: string) => {
		const { data: vars, error } = await VariablesService.list(id);
		if (error) {
			addToast({ id: Date.now().toString(), message: (error as Error).message, type: "error" });

			return;
		}

		if (vars?.length) {
			const isConnectionTypePat = vars.some((variable) => variable.name === "pat");
			setValue("selectedConnectionType", { value: isConnectionTypePat ? "pat" : "oauth" });
		}
	};

	useEffect(() => {
		if (connectionId) {
			fetchConnection(connectionId);
			fetchVariables(connectionId);
		}
		const randomForPATWebhook = randomatic("Aa0", 8);
		setWebhookUrl(`${apiBaseUrl}/${randomForPATWebhook}`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return {
		errors,
		control,
		handleSubmit,
		register,
		watch,
		isLoading,
		webhookUrl,
		copyToClipboard,
		handleConnection,
		handleOAuth,
		onSubmit,
		setValue,
		connectionId,
		fetchConnection,
	};
};

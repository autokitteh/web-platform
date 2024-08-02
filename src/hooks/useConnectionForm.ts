import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { ZodSchema } from "zod";

import { apiBaseUrl } from "@constants";
import { ConnectionService, HttpService, VariablesService } from "@services";
import { FormMode } from "@src/types/components";

import { useToastAndLog } from "@hooks";

export const useConnectionForm = (
	initialValues: DefaultValues<FieldValues> | undefined,
	validationSchema: ZodSchema,
	mode: FormMode,
	onSuccess?: () => void // Add this line
) => {
	const { connectionId: paramConnectionId, projectId } = useParams();
	const [connectionIntegrationName, setConnectionIntegrationName] = useState<string>();

	const {
		formState: { errors },
		getValues,
		handleSubmit,
		register,
		reset,
		setValue,
		watch,
	} = useForm({
		resolver: zodResolver(validationSchema),
		mode: "onChange",
		defaultValues: initialValues,
	});
	const toastAndLog = useToastAndLog(); // Initialize the utility function

	const [connectionId, setConnectionId] = useState(paramConnectionId);
	const [isLoading, setIsLoading] = useState(false);

	const fetchConnection = async (id: string) => {
		try {
			const { data: connectionResponse, error } = await ConnectionService.get(id);

			if (error) {
				toastAndLog("error", "errorFetchingConnection", error, true);

				return;
			}

			setConnectionIntegrationName(connectionResponse!.integrationUniqueName);
			setValue("connectionName", connectionResponse!.name);
			setValue("integration", {
				label: connectionResponse!.integrationName,
				value: connectionResponse!.integrationUniqueName,
			});
		} catch (error) {
			toastAndLog("error", "errorFetchingConnection", error);
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
				toastAndLog("error", "errorCreatingNewConnection", error, true);

				return;
			}

			setConnectionId(responseConnectionId);
		} catch (error) {
			toastAndLog("error", "errorCreatingNewConnection", error);
		} finally {
			setIsLoading(false);
		}
	};

	const resetConnectionId = () => {
		setConnectionId(undefined);
		setTimeout(() => setConnectionId(paramConnectionId || connectionId), 0);
	};

	const handleConnection = async (connectionId: string, integrationName: string): Promise<void> => {
		setIsLoading(true);

		const connectionData = getValues();

		try {
			await HttpService.post(`/${integrationName}/save?cid=${connectionId}&origin=web`, connectionData);
			toastAndLog("success", "connectionCreatedSuccessfully");

			onSuccess?.();
		} catch (error) {
			toastAndLog("error", "errorCreatingNewConnection", error);
			setIsLoading(false);
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
			toastAndLog("error", "errorCreatingNewConnection", error);
		} finally {
			setIsLoading(false);
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toastAndLog("success", "copySuccess", true);
		} catch (error) {
			toastAndLog("error", "copyError", true);
		}
	};

	const fetchVariables = async (id: string) => {
		const { data: vars, error } = await VariablesService.list(id);
		if (error) {
			toastAndLog("error", "errorFetchingVariables", error);

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return {
		errors,
		handleSubmit,
		onSubmit,
		register,
		watch,
		isLoading,
		copyToClipboard,
		handleConnection,
		handleOAuth,
		setValue,
		connectionId,
		fetchConnection,
		reset,
	};
};

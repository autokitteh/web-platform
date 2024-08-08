import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { ZodSchema } from "zod";

import { apiBaseUrl } from "@constants";
import { ConnectionService, HttpService, VariablesService } from "@services";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { FormMode } from "@src/types/components";
import { Variable } from "@src/types/models";
import { getEnumKeyByEnumValue } from "@src/utilities";

import { useToastAndLog } from "@hooks";

export const useConnectionForm = (
	initialValues: DefaultValues<FieldValues> | undefined,
	validationSchema: ZodSchema,
	mode: FormMode
) => {
	const { connectionId: paramConnectionId, projectId } = useParams();
	const [connectionIntegrationName, setConnectionIntegrationName] = useState<string>();
	const navigate = useNavigate();

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
	const [connectionType, setConnectionType] = useState<ConnectionAuthType | undefined>();
	const [connectionVariables, setConnectionVariables] = useState<Variable[] | undefined>();
	const [isLoading, setIsLoading] = useState(false);

	const getConnectionAuthType = async (connectionId: string) => {
		const { data: vars, error } = await VariablesService.list(connectionId);
		if (error) {
			toastAndLog("error", "errorFetchingVariables");

			return;
		}

		const connectionAuthType = vars?.find((variable) => variable.name === "auth_type");
		if (!connectionAuthType) {
			toastAndLog("error", "errorFetchingConnectionType");

			return;
		}
		const connectionAuthenticationType = getEnumKeyByEnumValue(ConnectionAuthType, connectionAuthType.value);

		if (!connectionAuthenticationType) {
			toastAndLog("error", "errorFetchingConnectionTypeUnknown");

			return;
		}

		setConnectionType(connectionAuthenticationType as ConnectionAuthType);
	};

	const getConnectionVariables = async (connectionId: string) => {
		const { data: vars, error } = await VariablesService.list(connectionId);
		if (error) {
			toastAndLog("error", "errorFetchingVariables", error);

			return;
		}

		setConnectionVariables(vars);
	};

	const handleConnection = async (
		connectionId: string,
		connectionAuthType: ConnectionAuthType,
		integrationName?: string
	): Promise<void> => {
		setIsLoading(true);

		const connectionData = getValues();

		try {
			await HttpService.post(`/${integrationName}/save?cid=${connectionId}&origin=web`, connectionData);
			VariablesService.set(
				connectionId!,
				{
					name: "auth_type",
					value: connectionAuthType,
					isSecret: false,
					scopeId: connectionId,
				},
				true
			);
			toastAndLog("success", "connectionCreatedSuccessfully");

			navigate(`/projects/${projectId}/connections/${connectionId}/edit`);
		} catch (error) {
			toastAndLog("error", "errorCreatingNewConnection", error);
			setIsLoading(false);
		}
	};

	const fetchConnection = async (connId: string) => {
		try {
			const { data: connectionResponse, error } = await ConnectionService.get(connId);

			if (error) {
				toastAndLog("error", "errorFetchingConnectionExtended", error, true);

				return;
			}

			setConnectionIntegrationName(connectionResponse!.integrationUniqueName as string);
			setValue("connectionName", connectionResponse!.name);
			setValue("integration", {
				label: connectionResponse!.integrationName,
				value: connectionResponse!.integrationUniqueName,
			});

			getConnectionAuthType(connId);
			getConnectionVariables(connId);
		} catch (error) {
			toastAndLog("error", "errorFetchingConnectionExtended", error);
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

	const onSubmit = async () => {
		createNewConnection();
	};

	const handleOAuth = async (oauthConnectionId: string, integrationName: Integrations) => {
		try {
			VariablesService.set(
				oauthConnectionId!,
				{
					name: "auth_type",
					value: ConnectionAuthType.Oauth,
					isSecret: false,
					scopeId: oauthConnectionId,
				},
				true
			);
			window.open(`${apiBaseUrl}/oauth/start/${integrationName}?cid=${oauthConnectionId}&origin=web`, "_blank");
			navigate(`/projects/${projectId}/connections`);
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

	useEffect(() => {
		if (connectionId && mode === "edit") {
			fetchConnection(connectionId);
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
		getValues,
		setValue,
		connectionId,
		fetchConnection,
		connectionIntegrationName,
		reset,
		connectionType,
		connectionVariables,
	};
};

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { ZodSchema } from "zod";

import { filterConnectionValues } from "@hooks/utils/filterConnectionsFormFields";
import { ConnectionService, HttpService, VariablesService } from "@services";
import { apiBaseUrl } from "@src/constants";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { FormMode } from "@src/types/components";
import { Variable } from "@src/types/models";

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
	const toastAndLog = useToastAndLog();

	const [connectionId, setConnectionId] = useState(paramConnectionId);
	const [connectionType, setConnectionType] = useState<string | undefined>();
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
		setConnectionType(connectionAuthType.value);
	};

	const getConnectionVariables = async (connectionId: string) => {
		const { data: vars, error } = await VariablesService.list(connectionId);
		if (error) {
			toastAndLog("error", "errorFetchingVariables", error);

			return;
		}

		setConnectionVariables(vars);
	};

	const createConnection = async (
		newConnectionId: string,
		connectionAuthType: ConnectionAuthType,
		integrationName?: string
	): Promise<void> => {
		setIsLoading(true);

		try {
			VariablesService.setByConnectiontId(newConnectionId!, {
				name: "auth_type",
				value: connectionAuthType,
				isSecret: false,
				scopeId: newConnectionId,
			});

			const connectionData = getValues();

			const filtereConnectionValues = filterConnectionValues(connectionData, (integrationName as Integrations)!);

			await HttpService.post(
				`/${integrationName}/save?cid=${newConnectionId}&origin=web`,
				filtereConnectionValues
			);
			toastAndLog("success", "connectionCreatedSuccessfully");
			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			toastAndLog("error", "errorCreatingNewConnection", error);
			setIsLoading(false);
		}
	};

	const editConnection = async (connectionId: string, integrationName?: string): Promise<void> => {
		setIsLoading(true);

		const connectionData = getValues();

		try {
			const filtereConnectionValues = filterConnectionValues(connectionData, (integrationName as Integrations)!);

			await HttpService.post(`/${integrationName}/save?cid=${connectionId}&origin=web`, filtereConnectionValues);
			toastAndLog("success", "connectionEditedSuccessfully");
			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			toastAndLog("error", "errorEditingNewConnection", error);
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

			await getConnectionAuthType(connId);
			await getConnectionVariables(connId);
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
		if (connectionId) {
			const connId = connectionId;
			setConnectionId(undefined);
			setTimeout(() => {
				setConnectionId(connId);
			}, 100);

			return;
		}
		createNewConnection();
	};

	const onSubmitEdit = async () => {
		editConnection(connectionId!, connectionIntegrationName);
	};

	const handleOAuth = async (oauthConnectionId: string, integrationName: Integrations) => {
		try {
			await VariablesService.setByConnectiontId(oauthConnectionId!, {
				name: "auth_type",
				value: ConnectionAuthType.Oauth,
				isSecret: false,
				scopeId: oauthConnectionId,
			});
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
		createConnection,
		handleOAuth,
		getValues,
		setValue,
		connectionId,
		fetchConnection,
		connectionIntegrationName,
		reset,
		connectionType,
		connectionVariables,
		onSubmitEdit,
	};
};

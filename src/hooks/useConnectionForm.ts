import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";
import { ZodObject, ZodRawShape } from "zod";

import { ConnectionService, HttpService, VariablesService } from "@services";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { useConnectionCheckerStore } from "@src/store";
import { FormMode } from "@src/types/components";
import { Variable } from "@src/types/models";
import { flattenFormData, getApiBaseUrl, openPopup } from "@src/utilities";

import { useToastAndLog } from "@hooks";

const GoogleIntegrationsPrefixRequired = [
	Integrations.sheets,
	Integrations.calendar,
	Integrations.drive,
	Integrations.forms,
];

export const useConnectionForm = (
	initialValues: DefaultValues<FieldValues> | undefined,
	validationSchema: ZodObject<ZodRawShape>,
	mode: FormMode
) => {
	const { connectionId: paramConnectionId, projectId } = useParams();
	const [connectionIntegrationName, setConnectionIntegrationName] = useState<string>();
	const navigate = useNavigate();
	const apiBaseUrl = getApiBaseUrl();
	const [formSchema, setFormSchema] = useState<ZodObject<ZodRawShape>>(validationSchema);
	const { setCheckerInterval } = useConnectionCheckerStore();

	const {
		clearErrors,
		control,
		formState: { errors },
		getValues,
		handleSubmit,
		register,
		reset,
		setValue,
		watch,
	} = useForm({
		resolver: zodResolver(formSchema),
		mode: "onChange",
		defaultValues: initialValues,
	});
	const toastAndLog = useToastAndLog("integrations", "errors");

	const [connectionId, setConnectionId] = useState(paramConnectionId);
	const [connectionType, setConnectionType] = useState<string | undefined>();
	const [connectionVariables, setConnectionVariables] = useState<Variable[] | undefined>();
	const [isLoading, setIsLoading] = useState(false);
	const [connectionName, setConnectionName] = useState<string | undefined>();
	const [integration, setIntegration] = useState<SingleValue<SelectOption>>();

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
		connectionId: string,
		connectionAuthType: ConnectionAuthType,
		integrationName?: string
	): Promise<void> => {
		setIsLoading(true);

		try {
			VariablesService.setByConnectiontId(connectionId!, {
				name: "auth_type",
				value: connectionAuthType,
				isSecret: false,
				scopeId: connectionId,
			});

			const connectionData = flattenFormData(getValues(), validationSchema);

			await HttpService.post(`/${integrationName}/save?cid=${connectionId}&origin=web`, connectionData);
			toastAndLog("success", "connectionCreatedSuccessfully");
			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			toastAndLog("error", "errorCreatingNewConnection", error);
		} finally {
			setIsLoading(false);
		}
	};

	const editConnection = async (connectionId: string, integrationName?: string): Promise<void> => {
		setIsLoading(true);

		const connectionData = flattenFormData(getValues(), validationSchema);

		try {
			await HttpService.post(`/${integrationName}/save?cid=${connectionId}&origin=web`, connectionData);
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
				toastAndLog("error", "errorFetchingConnection", error, true);

				return;
			}

			setConnectionIntegrationName(connectionResponse!.integrationUniqueName as string);
			setConnectionName(connectionResponse!.name);
			setIntegration({
				label: connectionResponse!.integrationName!,
				value: connectionResponse!.integrationUniqueName!,
			});

			await getConnectionAuthType(connId);
			await getConnectionVariables(connId);
		} catch (error) {
			toastAndLog("error", "errorFetchingConnection", error);
		}
	};

	const createNewConnection = async () => {
		try {
			setIsLoading(true);
			const {
				connectionName,
				integration: { value: integrationName },
			} = getValues();

			const integrationUniqueName = GoogleIntegrationsPrefixRequired.includes(integrationName)
				? `${Integrations.google}${integrationName}`
				: integrationName;

			const { data: responseConnectionId, error } = await ConnectionService.create(
				projectId!,
				integrationUniqueName,
				connectionName
			);

			if (error || !responseConnectionId) {
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

	const handleOAuth = async (oauthConnectionId: string, integrationName: keyof typeof Integrations) => {
		try {
			await VariablesService.setByConnectiontId(oauthConnectionId!, {
				name: "auth_type",
				value: ConnectionAuthType.Oauth,
				isSecret: false,
				scopeId: oauthConnectionId,
			});
			const OauthUrl = `${apiBaseUrl}/oauth/start/${integrationName}?cid=${oauthConnectionId}&origin=web`;

			openPopup(OauthUrl, "Authorize");
			setCheckerInterval(oauthConnectionId!);

			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			toastAndLog("error", "errorCreatingNewConnection", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleOauth = async (oauthConnectionId: string) => {
		setIsLoading(true);
		try {
			await VariablesService.setByConnectiontId(oauthConnectionId, {
				name: "auth_type",
				value: ConnectionAuthType.Oauth,
				isSecret: false,
				scopeId: oauthConnectionId,
			});

			const connectionData = flattenFormData(getValues(), validationSchema);
			const response = await fetch(
				`${apiBaseUrl}/${Integrations.google}/save?cid=${oauthConnectionId}&origin=web`,
				{
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams(connectionData).toString(),
				}
			);

			if (!response.url) {
				toastAndLog("error", "errorRetrieveOauthURL");
			}

			openPopup(response.url, "Authorize");
			setCheckerInterval(oauthConnectionId!);

			window.open(`${apiBaseUrl}/oauth/start/${integration}?cid=${oauthConnectionId}&origin=web`, "_blank");
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

	const setValidationSchema = (newSchema: ZodObject<ZodRawShape>) => {
		setFormSchema(newSchema);
		reset(getValues(), { keepErrors: true });
	};

	return {
		control,
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
		integration,
		connectionName,
		setValidationSchema,
		clearErrors,
		handleGoogleOauth,
	};
};

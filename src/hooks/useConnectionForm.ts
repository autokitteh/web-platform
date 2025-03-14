import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { FieldValues, UseFormGetValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";
import { ZodObject, ZodRawShape } from "zod";

import { ConnectionService, HttpService, LoggerService, VariablesService } from "@services";
import { namespaces } from "@src/constants";
import { integrationsCustomOAuthPaths } from "@src/constants/connections/integrationsCustomOAuthPaths";
import { integrationDataKeys } from "@src/constants/connections/integrationsDataKeys.constants";
import { ConnectionAuthType } from "@src/enums";
import {
	Integrations,
	ModalName,
	defaultGoogleConnectionName,
	isGoogleIntegration,
	isMicrosofIntegration,
	defaultMicrosoftConnectionName,
} from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { useCacheStore, useConnectionStore, useModalStore, useToastStore } from "@src/store";
import { FormMode } from "@src/types/components";
import { Variable } from "@src/types/models";
import { flattenFormData, getApiBaseUrl, openPopup, stripGoogleConnectionName } from "@src/utilities";

const GoogleIntegrationsPrefixRequired = [
	Integrations.sheets,
	Integrations.calendar,
	Integrations.drive,
	Integrations.forms,
];

export const useConnectionForm = (validationSchema: ZodObject<ZodRawShape>, mode: FormMode) => {
	const { connectionId: paramConnectionId, projectId } = useParams();
	const [connectionIntegrationName, setConnectionIntegrationName] = useState<string>();

	const navigate = useNavigate();
	const apiBaseUrl = getApiBaseUrl();
	const [formSchema, setFormSchema] = useState<ZodObject<ZodRawShape>>(validationSchema);
	const { startCheckingStatus, setConnectionInProgress, connectionInProgress: isLoading } = useConnectionStore();
	const { fetchConnections } = useCacheStore();
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
	});
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");

	const [connectionId, setConnectionId] = useState(paramConnectionId);
	const [editConnectionType, setEditConnectionType] = useState<string>();
	const [addConnectionType, setAddConnectionType] = useState<SingleValue<SelectOption>>();
	const [connectionVariables, setConnectionVariables] = useState<Variable[]>();
	const [connectionName, setConnectionName] = useState<string>();
	const [integration, setIntegration] = useState<SingleValue<SelectOption>>();
	const addToast = useToastStore((state) => state.addToast);
	const { closeModal } = useModalStore();

	const getConnectionAuthType = async (connectionId: string) => {
		const { data: vars, error } = await VariablesService.list(connectionId);
		if (error) {
			addToast({
				message: tErrors("errorFetchingVariables"),
				type: "error",
			});

			return;
		}

		const connectionAuthType = vars?.find((variable) => variable.name === "auth_type");

		if (connectionAuthType) {
			setEditConnectionType(connectionAuthType.value);
		}
	};

	const getConnectionVariables = async (connectionId: string) => {
		const { data: vars, error } = await VariablesService.list(connectionId);
		if (error) {
			addToast({
				message: tErrors("errorFetchingVariables"),
				type: "error",
			});

			return;
		}

		setConnectionVariables(vars);
	};

	const getFormattedConnectionData = (
		getValues: UseFormGetValues<FieldValues>,
		formSchema: ZodObject<ZodRawShape>,
		integrationName?: string
	) => {
		const connectionData = flattenFormData(getValues(), formSchema);
		let formattedIntegrationName = integrationName;
		if (integrationName && isGoogleIntegration(stripGoogleConnectionName(integrationName) as Integrations)) {
			formattedIntegrationName = defaultGoogleConnectionName;
		} else if (integrationName && isMicrosofIntegration(integrationName as Integrations)) {
			formattedIntegrationName = defaultMicrosoftConnectionName;
		}

		return { connectionData, formattedIntegrationName };
	};

	const getSpecificParams = (connectionData: Record<string, string>, specificKeys: string[]) => {
		return specificKeys
			.map((key) => (connectionData[key] ? `${key}=${encodeURIComponent(connectionData[key])}` : ""))
			.filter((param) => param !== "")
			.join("&");
	};

	const createConnection = async (
		connectionId: string,
		connectionAuthType: ConnectionAuthType,
		integrationName?: string
	): Promise<void> => {
		try {
			setConnectionInProgress(true);
			const { error } = await VariablesService.setByConnectiontId(connectionId!, {
				name: "auth_type",
				value: connectionAuthType,
				isSecret: false,
				scopeId: connectionId,
			});
			if (error) {
				addToast({
					message: tErrors("errorSettingConnectionType"),
					type: "error",
				});
			}

			const { connectionData, formattedIntegrationName } = getFormattedConnectionData(
				getValues,
				formSchema,
				integrationName
			);

			await HttpService.post(
				`/${formattedIntegrationName}/save?cid=${connectionId}&origin=web&auth_type=${connectionAuthType}`,
				connectionData
			);
			addToast({
				message: t("connectionCreateSuccess"),
				type: "success",
			});
			LoggerService.info(
				namespaces.hooks.connectionForm,
				t("connectionCreateSuccessExtendedID", { connectionId })
			);

			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			addToast({
				message: tErrors("errorCreatingNewConnection"),
				type: "error",
			});
			if (isAxiosError(error)) {
				LoggerService.error(
					namespaces.hooks.connectionForm,
					tErrors("errorCreatingNewConnectionExtended", { error: error?.response?.data })
				);
				setConnectionInProgress(false);

				return;
			}
			LoggerService.error(
				namespaces.hooks.connectionForm,
				tErrors("errorCreatingNewConnectionExtended", { error })
			);
		}
	};

	const editConnection = async (connectionId: string, integrationName?: string): Promise<void> => {
		try {
			setConnectionInProgress(true);
			if (editConnectionType) {
				const { error } = await VariablesService.setByConnectiontId(connectionId!, {
					name: "auth_type",
					value: editConnectionType,
					isSecret: false,
					scopeId: connectionId,
				});
				if (error) {
					addToast({
						message: tErrors("errorSettingConnectionType"),
						type: "error",
					});
				}
			}

			const { connectionData, formattedIntegrationName } = getFormattedConnectionData(
				getValues,
				formSchema,
				integrationName!
			);

			await HttpService.post(
				`/${formattedIntegrationName}/save?cid=${connectionId}&origin=web&auth_type=${editConnectionType}`,
				connectionData
			);

			addToast({
				message: t("connectionEditedSuccessfully"),
				type: "success",
			});
			LoggerService.info(
				namespaces.hooks.connectionForm,
				t("connectionEditedSuccessfullyExtended", { connectionId, connectionName })
			);
			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			addToast({
				message: tErrors("errorEditingConnection"),
				type: "error",
			});

			if (isAxiosError(error)) {
				LoggerService.error(
					namespaces.hooks.connectionForm,
					tErrors("errorEditingConnectionExtended", { error: error?.response?.data })
				);
				setConnectionInProgress(false);

				return;
			}
			LoggerService.error(namespaces.hooks.connectionForm, tErrors("errorEditingConnectionExtended", { error }));
		} finally {
			setConnectionInProgress(false);
		}
	};

	const fetchConnection = async (connectionId: string) => {
		try {
			const { data: connectionResponse, error } = await ConnectionService.get(connectionId);

			if (error) {
				addToast({
					message: tErrors("errorFetchingConnection", { connectionId }),
					type: "error",
				});
			}

			setConnectionIntegrationName(connectionResponse!.integrationUniqueName as string);
			setConnectionName(connectionResponse!.name);
			if (connectionResponse?.integrationName && connectionResponse?.integrationUniqueName) {
				setIntegration({
					label: connectionResponse.integrationName!,
					value: connectionResponse.integrationUniqueName!,
				});
			} else {
				setIntegration(undefined);
			}

			await getConnectionAuthType(connectionId);
			await getConnectionVariables(connectionId);
		} catch (error) {
			const message = tErrors("errorFetchingConnectionExtended", {
				connectionId,
				error: (error as Error).message,
			});
			addToast({
				message: tErrors("errorFetchingConnection", { connectionId }),
				type: "error",
			});

			LoggerService.error(namespaces.hooks.connectionForm, message);
		}
	};

	const createNewConnection = async () => {
		try {
			setConnectionInProgress(true);
			const {
				connectionName,
				integration: { value: integrationName },
			} = getValues();

			const integrationUniqueName = GoogleIntegrationsPrefixRequired.includes(integrationName)
				? `${defaultGoogleConnectionName}${integrationName}`
				: integrationName;

			const { data: responseConnectionId, error } = await ConnectionService.create(
				projectId!,
				integrationUniqueName,
				connectionName
			);

			if (error) {
				addToast({
					message: tErrors("connectionNotCreated"),
					type: "error",
				});

				return;
			}

			await fetchConnections(projectId!, true);

			LoggerService.info(
				namespaces.hooks.connectionForm,
				t("connectionUpdatedSuccessExtended", { connectionName, connectionId: responseConnectionId })
			);

			setConnectionId(responseConnectionId);
		} catch (error) {
			setConnectionInProgress(false);
			addToast({
				message: tErrors("connectionNotCreated"),
				type: "error",
			});
			LoggerService.error(namespaces.hooks.connectionForm, tErrors("connectionNotCreatedExtended", { error }));
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
		closeModal(ModalName.warningDeploymentActive);
		editConnection(connectionId!, connectionIntegrationName);
	};

	const handleOAuth = async (oauthConnectionId: string, integrationName: keyof typeof Integrations) => {
		const oauthType = ConnectionAuthType.OauthDefault;

		try {
			setConnectionInProgress(true);
			await VariablesService.setByConnectiontId(oauthConnectionId!, {
				name: "auth_type",
				value: oauthType,
				isSecret: false,
				scopeId: oauthConnectionId,
			});
			const formattedIntegrationName =
				integrationName && isMicrosofIntegration(integrationName as Integrations)
					? defaultMicrosoftConnectionName
					: integrationName;
			const OauthUrl = `${apiBaseUrl}/${formattedIntegrationName}/save?cid=${oauthConnectionId}&origin=web&auth_type=${oauthType}`;

			openPopup(OauthUrl, "Authorize");
			startCheckingStatus(oauthConnectionId);

			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			addToast({
				message: tErrors("errorCreatingNewConnection"),
				type: "error",
			});

			LoggerService.error(
				namespaces.hooks.connectionForm,
				tErrors("errorCreatingNewConnectionExtended", { error })
			);
		} finally {
			setConnectionInProgress(false);
		}
	};

	const handleLegacyOAuth = async (oauthConnectionId: string, integrationName: keyof typeof Integrations) => {
		const oauthType = ConnectionAuthType.Oauth;
		try {
			setConnectionInProgress(true);
			await VariablesService.setByConnectiontId(oauthConnectionId!, {
				name: "auth_type",
				value: oauthType,
				isSecret: false,
				scopeId: oauthConnectionId,
			});

			const OauthUrl = `${apiBaseUrl}/oauth/start/${integrationName}?cid=${oauthConnectionId}&origin=web&auth_type=${oauthType}`;

			openPopup(OauthUrl, "Authorize");
			startCheckingStatus(oauthConnectionId);

			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			addToast({
				message: tErrors("errorCreatingNewConnection"),
				type: "error",
			});

			LoggerService.error(
				namespaces.hooks.connectionForm,
				tErrors("errorCreatingNewConnectionExtended", { error })
			);
		} finally {
			setConnectionInProgress(false);
		}
	};

	const handleCustomOauth = async (
		oauthConnectionId: string,
		integrationName: keyof typeof Integrations | typeof defaultGoogleConnectionName,
		authType:
			| ConnectionAuthType.OauthPrivate
			// TODO: remove ConnectionAuthType.Oauth and move to move all to ConnectionAuthType.OauthDefault
			| ConnectionAuthType.Oauth
			| ConnectionAuthType.OauthDefault = ConnectionAuthType.Oauth
	) => {
		try {
			setConnectionInProgress(true);
			await VariablesService.setByConnectiontId(oauthConnectionId, {
				name: "auth_type",
				value: authType,
				isSecret: false,
				scopeId: oauthConnectionId,
			});

			const { connectionData, formattedIntegrationName } = getFormattedConnectionData(
				getValues,
				formSchema,
				integrationName
			);
			const urlParams = getSpecificParams(
				connectionData,
				integrationDataKeys[integrationName.toString() as keyof typeof integrationDataKeys]
			);

			const customURLPath = integrationsCustomOAuthPaths[integrationName as keyof typeof Integrations] || "save";

			openPopup(
				`${apiBaseUrl}/${formattedIntegrationName}/${customURLPath}?cid=${oauthConnectionId}&origin=web&auth_type=${authType}&${urlParams}`,
				"Authorize"
			);
			startCheckingStatus(oauthConnectionId);
			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			addToast({
				message: tErrors("errorCreatingNewConnection"),
				type: "error",
			});

			LoggerService.error(
				namespaces.hooks.connectionForm,
				tErrors("errorCreatingNewConnectionExtended", { error })
			);
		} finally {
			setConnectionInProgress(false);
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);

			addToast({
				message: t("copySuccess"),
				type: "success",
			});
		} catch (error) {
			addToast({
				message: t("copyFailure"),
				type: "error",
			});
			LoggerService.error(namespaces.hooks.connectionForm, t("copyFailureExtended", { error }));
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
		handleLegacyOAuth,
		getValues,
		setValue,
		connectionId,
		fetchConnection,
		connectionIntegrationName,
		reset,
		editConnectionType,
		connectionVariables,
		onSubmitEdit,
		integration,
		connectionName,
		setValidationSchema,
		clearErrors,
		handleCustomOauth,
		setEditConnectionType,
		addConnectionType,
		setAddConnectionType,
	};
};

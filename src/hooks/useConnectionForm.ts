/* eslint-disable no-console */
import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { FieldValues, UseFormGetValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";
import { ZodEffects, ZodObject, ZodRawShape, ZodSchema } from "zod";

import { ConnectionService, HttpService, LoggerService, VariablesService } from "@services";
import { namespaces } from "@src/constants";
import { integrationsCustomOAuthPaths } from "@src/constants/connections/integrationsCustomOAuthPaths";
import { integrationDataKeys } from "@src/constants/connections/integrationsDataKeys.constants";
import { integrationVariablesMapping } from "@src/constants/connections/integrationVariablesMapping.constants";
import { selectIntegrationLinearActor } from "@src/constants/lists/connections";
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
import {
	useCacheStore,
	useConnectionStore,
	useGlobalConnectionsStore,
	useModalStore,
	useOrganizationStore,
	useToastStore,
} from "@src/store";
import { FormMode } from "@src/types/components";
import { Variable } from "@src/types/models";
import {
	flattenFormData,
	getApiBaseUrl,
	getDefaultAuthType,
	openPopup,
	stripGoogleConnectionName,
} from "@src/utilities";

const GoogleIntegrationsPrefixRequired = [
	Integrations.sheets,
	Integrations.calendar,
	Integrations.drive,
	Integrations.forms,
];

export const useConnectionForm = (
	validationSchema: ZodSchema,
	mode: FormMode,
	authOptions?: SelectOption[],
	isGlobalConnectionProp?: boolean
) => {
	const { id: paramConnectionId, projectId } = useParams();
	const editingConnectionId = useConnectionStore((state) => state.editingConnectionId);
	const effectiveConnectionId = editingConnectionId || paramConnectionId;
	const location = useLocation();
	const isGlobalConnection = isGlobalConnectionProp ?? location.pathname.startsWith("/connections");
	const { currentOrganization } = useOrganizationStore();
	const orgId = currentOrganization?.id;
	const [connectionIntegrationName, setConnectionIntegrationName] = useState<string>();
	const navigate = useNavigate();
	const apiBaseUrl = getApiBaseUrl();
	const [formSchema, setFormSchema] = useState<ZodSchema>(validationSchema);
	const { startCheckingStatus, setConnectionInProgress, connectionInProgress: isLoading } = useConnectionStore();
	const { fetchConnections } = useCacheStore();
	const { fetchGlobalConnections } = useGlobalConnectionsStore();

	console.log("[useConnectionForm] Hook initialized:", {
		mode,
		paramConnectionId,
		projectId,
		isGlobalConnection,
		isGlobalConnectionProp,
		pathname: location.pathname,
		orgId,
		hasAuthOptions: !!authOptions,
		authOptionsLength: authOptions?.length,
	});
	const {
		clearErrors,
		control,
		formState: { errors },
		getValues,
		handleSubmit,
		register,
		reset,
		setValue,
		trigger,
		watch,
	} = useForm({
		resolver: zodResolver(formSchema),
		mode: "onChange",
	});
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");

	const [connectionId, setConnectionId] = useState(effectiveConnectionId);

	useEffect(() => {
		if (effectiveConnectionId && effectiveConnectionId !== connectionId) {
			setConnectionId(effectiveConnectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [effectiveConnectionId]);

	const [connectionType, setConnectionType] = useState<ConnectionAuthType>();
	const [connectionVariables, setConnectionVariables] = useState<Variable[]>();
	const [connectionName, setConnectionName] = useState<string>();
	const [integration, setIntegration] = useState<SingleValue<SelectOption>>();
	const addToast = useToastStore((state) => state.addToast);
	const { closeModal } = useModalStore();

	console.log("[useConnectionForm] State values:", {
		connectionId,
		connectionType,
		connectionVariables: connectionVariables?.length,
		connectionName,
		integration,
		isLoading,
	});

	const getConnectionAuthType = async (connectionId: string, integrationName?: string) => {
		console.log("[useConnectionForm] getConnectionAuthType called:", { connectionId, integrationName });
		const { data: vars, error } = await VariablesService.list(connectionId);
		console.log("[useConnectionForm] getConnectionAuthType - VariablesService.list result:", {
			varsCount: vars?.length,
			error,
			vars: vars?.map((v) => ({ name: v.name, value: v.value })),
		});
		if (error) {
			console.error("[useConnectionForm] getConnectionAuthType - Error fetching variables:", error);
			addToast({
				message: tErrors("errorFetchingVariables"),
				type: "error",
			});

			return;
		}

		const connectionAuthType = vars?.find((variable) => variable.name === "auth_type");
		console.log("[useConnectionForm] getConnectionAuthType - Found auth_type:", connectionAuthType);

		if (connectionAuthType) {
			console.log(
				"[useConnectionForm] getConnectionAuthType - Setting connectionType from variable:",
				connectionAuthType.value
			);
			setConnectionType(connectionAuthType.value as ConnectionAuthType);
		} else if (authOptions && authOptions.length > 0 && integrationName) {
			console.log("[useConnectionForm] getConnectionAuthType - Trying to get default auth type:", {
				authOptions,
				integrationName,
			});
			try {
				const defaultOption = getDefaultAuthType(authOptions, integrationName as keyof typeof Integrations);
				console.log(
					"[useConnectionForm] getConnectionAuthType - Setting default auth type:",
					defaultOption.value
				);
				setConnectionType(defaultOption.value as ConnectionAuthType);
			} catch (e) {
				console.warn("[useConnectionForm] getConnectionAuthType - getDefaultAuthType failed:", e);
			}
		} else {
			console.log("[useConnectionForm] getConnectionAuthType - No auth type set, conditions not met:", {
				hasAuthOptions: !!authOptions,
				authOptionsLength: authOptions?.length,
				integrationName,
			});
		}
	};

	const getConnectionVariables = async (connectionId: string, integrationName?: string) => {
		console.log("[useConnectionForm] getConnectionVariables called:", { connectionId });
		const { data: vars, error } = await VariablesService.list(connectionId);
		console.log("[useConnectionForm] getConnectionVariables - Result:", {
			varsCount: vars?.length,
			error,
			varNames: vars?.map((v) => v.name),
		});
		if (error) {
			console.error("[useConnectionForm] getConnectionVariables - Error:", error);
			addToast({
				message: tErrors("errorFetchingVariables"),
				type: "error",
			});

			return;
		}

		console.log("[useConnectionForm] getConnectionVariables - Setting variables:", vars?.length);
		setConnectionVariables(vars);

		if (vars && integrationName) {
			const mapping = integrationVariablesMapping[integrationName as keyof typeof integrationVariablesMapping];
			if (mapping) {
				Object.entries(mapping).forEach(([formFieldName, variableName]) => {
					const variable = vars.find((v) => v.name === variableName);
					if (!variable?.value) return;

					if (formFieldName === "region") {
						setValue(formFieldName, { label: variable.value, value: variable.value });
					} else if (formFieldName === "actor") {
						const actor = selectIntegrationLinearActor.find((a) => a.value === variable.value);
						if (actor) {
							setValue(formFieldName, { label: actor.label, value: actor.value });
						}
					} else {
						setValue(formFieldName, variable.value);
					}
				});
			}
		}
	};

	const getFormattedConnectionData = (
		getValues: UseFormGetValues<FieldValues>,
		formSchema: ZodObject<ZodRawShape> | ZodEffects<any>,
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

	const handleConnectionSuccess = (connId: string) => {
		console.log("[useConnectionForm] handleConnectionSuccess called:", {
			connId,
			isGlobalConnection,
			projectId,
		});
		startCheckingStatus(connId);
		if (isGlobalConnection) {
			console.log(
				"[useConnectionForm] handleConnectionSuccess - Navigating to global connection edit:",
				`/connections/${connId}/edit`
			);
			navigate(`/connections/${connId}/edit`);

			return;
		}
		if (projectId) {
			console.log(
				"[useConnectionForm] handleConnectionSuccess - Navigating to project connection edit:",
				`/projects/${projectId}/explorer/settings/connections/${connId}/edit`
			);
			navigate(`/projects/${projectId}/explorer/settings/connections/${connId}/edit`);

			return;
		}
		if (projectId) {
			navigate(`/projects/${projectId}/explorer/settings/connections/${connId}/edit`);

			return;
		}
		console.log("[useConnectionForm] handleConnectionSuccess - Navigating to parent (..)");
		navigate("..");
	};

	const createConnection = async (
		connectionId: string,
		connectionAuthType: ConnectionAuthType,
		integrationName?: string
	): Promise<void> => {
		console.log("[useConnectionForm] createConnection called:", {
			connectionId,
			connectionAuthType,
			integrationName,
		});
		try {
			setConnectionInProgress(true);
			console.log("[useConnectionForm] createConnection - Setting auth_type variable");
			const { error } = await VariablesService.setByConnectiontId(connectionId!, {
				name: "auth_type",
				value: connectionAuthType,
				isSecret: false,
				scopeId: connectionId,
			});
			if (error) {
				console.error("[useConnectionForm] createConnection - Error setting auth_type:", error);
				addToast({
					message: tErrors("errorSettingConnectionType"),
					type: "error",
				});
			}

			const { connectionData, formattedIntegrationName } = getFormattedConnectionData(
				getValues,
				formSchema as ZodObject<ZodRawShape> | ZodEffects<any>,
				integrationName
			);
			console.log("[useConnectionForm] createConnection - Formatted data:", {
				connectionData,
				formattedIntegrationName,
				url: `/${formattedIntegrationName}/save?cid=${connectionId}&origin=web&auth_type=${connectionAuthType}`,
			});
			await HttpService.post(
				`/${formattedIntegrationName}/save?cid=${connectionId}&origin=web&auth_type=${connectionAuthType}`,
				connectionData
			);

			console.log("[useConnectionForm] createConnection - Success, showing toast");
			addToast({
				message: t("connectionCreateSuccess"),
				type: "success",
			});
			LoggerService.info(
				namespaces.hooks.connectionForm,
				t("connectionCreateSuccessExtendedID", { connectionId })
			);
			handleConnectionSuccess(connectionId);
		} catch (error) {
			console.error("[useConnectionForm] createConnection - Error:", error);
			addToast({
				message: tErrors("errorCreatingNewConnection"),
				type: "error",
			});
			if (isAxiosError(error)) {
				console.error("[useConnectionForm] createConnection - Axios error response:", error?.response?.data);
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
		} finally {
			console.log("[useConnectionForm] createConnection - Finally block, setting connectionInProgress to false");
			setConnectionInProgress(false);
		}
	};

	const editConnection = async (connectionId: string, integrationName?: string): Promise<void> => {
		console.log("[useConnectionForm] editConnection called:", {
			connectionId,
			integrationName,
			connectionType,
		});
		try {
			setConnectionInProgress(true);
			if (connectionType) {
				console.log("[useConnectionForm] editConnection - Setting auth_type variable:", connectionType);
				const { error } = await VariablesService.setByConnectiontId(connectionId!, {
					name: "auth_type",
					value: connectionType,
					isSecret: false,
					scopeId: connectionId,
				});
				if (error) {
					console.error("[useConnectionForm] editConnection - Error setting auth_type:", error);
					addToast({
						message: tErrors("errorSettingConnectionType"),
						type: "error",
					});
				}
			} else {
				console.log("[useConnectionForm] editConnection - No connectionType set, skipping auth_type variable");
			}

			const { connectionData, formattedIntegrationName } = getFormattedConnectionData(
				getValues,
				formSchema as ZodObject<ZodRawShape> | ZodEffects<any>,
				integrationName!
			);
			console.log("[useConnectionForm] editConnection - Formatted data:", {
				connectionData,
				formattedIntegrationName,
				url: `/${formattedIntegrationName}/save?cid=${connectionId}&origin=web&auth_type=${connectionType}`,
			});

			await HttpService.post(
				`/${formattedIntegrationName}/save?cid=${connectionId}&origin=web&auth_type=${connectionType}`,
				connectionData
			);

			console.log("[useConnectionForm] editConnection - Success, showing toast");
			addToast({
				message: t("connectionEditedSuccessfully"),
				type: "success",
			});
			LoggerService.info(
				namespaces.hooks.connectionForm,
				t("connectionEditedSuccessfullyExtended", { connectionId, connectionName })
			);
			handleConnectionSuccess(connectionId);
		} catch (error) {
			console.error("[useConnectionForm] editConnection - Error:", error);
			addToast({
				message: tErrors("errorEditingConnection"),
				type: "error",
			});

			if (isAxiosError(error)) {
				console.error("[useConnectionForm] editConnection - Axios error response:", error?.response?.data);
				LoggerService.error(
					namespaces.hooks.connectionForm,
					tErrors("errorEditingConnectionExtended", { error: error?.response?.data })
				);

				return;
			}
			LoggerService.error(namespaces.hooks.connectionForm, tErrors("errorEditingConnectionExtended", { error }));
		} finally {
			console.log("[useConnectionForm] editConnection - Finally block, setting connectionInProgress to false");
			setConnectionInProgress(false);
		}
	};

	const fetchConnection = async (connectionId: string) => {
		console.log("[useConnectionForm] fetchConnection called:", { connectionId });
		try {
			const { data: connectionResponse, error } = await ConnectionService.get(connectionId);
			console.log("[useConnectionForm] fetchConnection - ConnectionService.get result:", {
				connectionResponse: connectionResponse
					? {
							name: connectionResponse.name,
							integrationName: connectionResponse.integrationName,
							integrationUniqueName: connectionResponse.integrationUniqueName,
						}
					: null,
				error,
			});

			if (error) {
				console.error("[useConnectionForm] fetchConnection - Error:", error);
				addToast({
					message: tErrors("errorFetchingConnection", { connectionId }),
					type: "error",
				});
			}

			console.log(
				"[useConnectionForm] fetchConnection - Setting connectionIntegrationName:",
				connectionResponse!.integrationUniqueName
			);
			setConnectionIntegrationName(connectionResponse!.integrationUniqueName as string);
			console.log("[useConnectionForm] fetchConnection - Setting connectionName:", connectionResponse!.name);
			setConnectionName(connectionResponse!.name);
			if (connectionResponse?.integrationName && connectionResponse?.integrationUniqueName) {
				console.log("[useConnectionForm] fetchConnection - Setting integration:", {
					label: connectionResponse.integrationName,
					value: connectionResponse.integrationUniqueName,
				});
				setIntegration({
					label: connectionResponse.integrationName!,
					value: connectionResponse.integrationUniqueName!,
				});
			} else {
				console.log("[useConnectionForm] fetchConnection - Setting integration to undefined");
				setIntegration(undefined);
			}

			console.log("[useConnectionForm] fetchConnection - Calling getConnectionAuthType");
			await getConnectionAuthType(connectionId, connectionResponse?.integrationUniqueName);
			console.log("[useConnectionForm] fetchConnection - Calling getConnectionVariables");
			await getConnectionVariables(connectionId, connectionResponse?.integrationUniqueName);
			console.log("[useConnectionForm] fetchConnection - Completed successfully");
		} catch (error) {
			console.error("[useConnectionForm] fetchConnection - Catch block error:", error);
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
		console.log("[useConnectionForm] createNewConnection called");
		try {
			setConnectionInProgress(true);
			const formValues = getValues();
			console.log("[useConnectionForm] createNewConnection - Form values:", formValues);
			const {
				connectionName,
				integration: { value: integrationName },
			} = formValues;

			const integrationUniqueName = GoogleIntegrationsPrefixRequired.includes(integrationName)
				? `${defaultGoogleConnectionName}${integrationName}`
				: integrationName;
			console.log("[useConnectionForm] createNewConnection - Integration info:", {
				connectionName,
				integrationName,
				integrationUniqueName,
				isGoogleIntegration: GoogleIntegrationsPrefixRequired.includes(integrationName),
			});

			let responseConnectionId: string | undefined;
			let error: unknown;
			if (isGlobalConnection && orgId) {
				console.log("[useConnectionForm] createNewConnection - Creating GLOBAL connection:", {
					orgId,
					integrationUniqueName,
					connectionName,
				});
				const result = await ConnectionService.createGlobal(orgId, integrationUniqueName, connectionName);
				console.log("[useConnectionForm] createNewConnection - Global connection result:", result);
				responseConnectionId = result.data;
				error = result.error;
			} else if (projectId) {
				console.log("[useConnectionForm] createNewConnection - Creating PROJECT connection:", {
					projectId,
					integrationUniqueName,
					connectionName,
				});
				const result = await ConnectionService.create(projectId, integrationUniqueName, connectionName);
				console.log("[useConnectionForm] createNewConnection - Project connection result:", result);
				responseConnectionId = result.data;
				error = result.error;
			} else {
				console.error(
					"[useConnectionForm] createNewConnection - No orgId or projectId, cannot create connection:",
					{
						isGlobalConnection,
						orgId,
						projectId,
					}
				);
				setConnectionInProgress(false);
				addToast({
					message: tErrors("connectionNotCreated"),
					type: "error",
				});
				LoggerService.error(
					namespaces.hooks.connectionForm,
					tErrors("connectionNotCreatedExtended", { error: (error as Error)?.message ?? "Unknown error" })
				);
				return;
			}

			if (error) {
				console.error("[useConnectionForm] createNewConnection - Error from service:", error);
				setConnectionInProgress(false);
				addToast({
					message: tErrors("connectionNotCreated"),
					type: "error",
				});

				LoggerService.error(
					namespaces.hooks.connectionForm,
					tErrors("connectionNotCreatedExtended", { error: (error as Error)?.message ?? "Unknown error" })
				);
				return;
			}

			console.log(
				"[useConnectionForm] createNewConnection - Connection created successfully:",
				responseConnectionId
			);

			if (isGlobalConnection && orgId) {
				console.log("[useConnectionForm] createNewConnection - Fetching global connections");
				await fetchGlobalConnections(orgId, true);
			} else if (projectId) {
				console.log("[useConnectionForm] createNewConnection - Fetching project connections");
				await fetchConnections(projectId, true);
			}

			LoggerService.info(
				namespaces.hooks.connectionForm,
				t("connectionUpdatedSuccessExtended", { connectionName, connectionId: responseConnectionId })
			);

			console.log("[useConnectionForm] createNewConnection - Setting connectionId state:", responseConnectionId);
			setConnectionId(responseConnectionId);
		} catch (error) {
			console.error("[useConnectionForm] createNewConnection - Catch block error:", error);
			setConnectionInProgress(false);
			addToast({
				message: tErrors("connectionNotCreated"),
				type: "error",
			});
			LoggerService.error(
				namespaces.hooks.connectionForm,
				tErrors("connectionNotCreatedExtended", { error: (error as Error)?.message ?? "Unknown error" })
			);
		}
	};

	const onSubmit = async () => {
		console.log("[useConnectionForm] onSubmit called:", {
			connectionId,
			hasConnectionId: !!connectionId,
		});
		if (connectionId) {
			console.log(
				"[useConnectionForm] onSubmit - ConnectionId exists, triggering re-render cycle:",
				connectionId
			);
			const connId = connectionId;
			setConnectionId(undefined);
			setTimeout(() => {
				console.log("[useConnectionForm] onSubmit - Restoring connectionId after timeout:", connId);
				setConnectionId(connId);
			}, 100);

			return;
		}
		console.log("[useConnectionForm] onSubmit - No connectionId, calling createNewConnection");
		createNewConnection();
	};

	const onSubmitEdit = async () => {
		console.log("[useConnectionForm] onSubmitEdit called:", {
			connectionId,
			connectionIntegrationName,
		});
		closeModal(ModalName.warningDeploymentActive);
		editConnection(connectionId!, connectionIntegrationName);
	};

	const handleOAuth = async (oauthConnectionId: string, integrationName: keyof typeof Integrations) => {
		console.log("[useConnectionForm] handleOAuth called:", {
			oauthConnectionId,
			integrationName,
		});
		const oauthType = ConnectionAuthType.OauthDefault;
		const connectionData = getValues();
		console.log("[useConnectionForm] handleOAuth - Connection data:", connectionData);
		try {
			setConnectionInProgress(true);
			console.log("[useConnectionForm] handleOAuth - Setting auth_type variable");
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

			const urlParams = getSpecificParams(
				connectionData,
				integrationDataKeys[integrationName.toString() as keyof typeof integrationDataKeys]
			);

			const OauthUrl = `${apiBaseUrl}/${formattedIntegrationName}/save?cid=${oauthConnectionId}&origin=web&auth_type=${oauthType}&${urlParams}`;
			console.log("[useConnectionForm] handleOAuth - Opening popup:", OauthUrl);

			openPopup(OauthUrl, "Authorize");
			handleConnectionSuccess(oauthConnectionId);
		} catch (error) {
			console.error("[useConnectionForm] handleOAuth - Error:", error);
			addToast({
				message: tErrors("errorCreatingNewConnection"),
				type: "error",
			});

			LoggerService.error(
				namespaces.hooks.connectionForm,
				tErrors("errorCreatingNewConnectionExtended", { error: (error as Error)?.message ?? "Unknown error" })
			);
		} finally {
			console.log("[useConnectionForm] handleOAuth - Finally block");
			setConnectionInProgress(false);
		}
	};

	const handleLegacyOAuth = async (oauthConnectionId: string, integrationName: keyof typeof Integrations) => {
		console.log("[useConnectionForm] handleLegacyOAuth called:", {
			oauthConnectionId,
			integrationName,
		});
		const oauthType = ConnectionAuthType.Oauth;
		try {
			setConnectionInProgress(true);
			console.log("[useConnectionForm] handleLegacyOAuth - Setting auth_type variable");
			await VariablesService.setByConnectiontId(oauthConnectionId!, {
				name: "auth_type",
				value: oauthType,
				isSecret: false,
				scopeId: oauthConnectionId,
			});

			const OauthUrl = `${apiBaseUrl}/oauth/start/${integrationName}?cid=${oauthConnectionId}&origin=web&auth_type=${oauthType}`;
			console.log("[useConnectionForm] handleLegacyOAuth - Opening popup:", OauthUrl);

			openPopup(OauthUrl, "Authorize");
			handleConnectionSuccess(oauthConnectionId);
		} catch (error) {
			console.error("[useConnectionForm] handleLegacyOAuth - Error:", error);
			addToast({
				message: tErrors("errorCreatingNewConnection"),
				type: "error",
			});

			LoggerService.error(
				namespaces.hooks.connectionForm,
				tErrors("errorCreatingNewConnectionExtended", { error: (error as Error)?.message ?? "Unknown error" })
			);
		} finally {
			console.log("[useConnectionForm] handleLegacyOAuth - Finally block");
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
		console.log("[useConnectionForm] handleCustomOauth called:", {
			oauthConnectionId,
			integrationName,
			authType,
		});
		try {
			setConnectionInProgress(true);
			console.log("[useConnectionForm] handleCustomOauth - Setting auth_type variable");
			await VariablesService.setByConnectiontId(oauthConnectionId, {
				name: "auth_type",
				value: authType,
				isSecret: false,
				scopeId: oauthConnectionId,
			});

			const { connectionData, formattedIntegrationName } = getFormattedConnectionData(
				getValues,
				formSchema as ZodObject<ZodRawShape> | ZodEffects<any>,
				integrationName
			);
			console.log("[useConnectionForm] handleCustomOauth - Formatted data:", {
				connectionData,
				formattedIntegrationName,
			});
			const urlParams = getSpecificParams(
				connectionData,
				integrationDataKeys[integrationName.toString() as keyof typeof integrationDataKeys]
			);

			const customURLPath = integrationsCustomOAuthPaths[integrationName as keyof typeof Integrations] || "save";

			const oauthUrl = `${apiBaseUrl}/${formattedIntegrationName}/${customURLPath}?cid=${oauthConnectionId}&origin=web&auth_type=${authType}&${urlParams}`;
			console.log("[useConnectionForm] handleCustomOauth - Opening popup:", oauthUrl);

			openPopup(oauthUrl, "Authorize");
			handleConnectionSuccess(oauthConnectionId);
		} catch (error) {
			console.error("[useConnectionForm] handleCustomOauth - Error:", error);
			addToast({
				message: tErrors("errorCreatingNewConnection"),
				type: "error",
			});

			LoggerService.error(
				namespaces.hooks.connectionForm,
				tErrors("errorCreatingNewConnectionExtended", { error: (error as Error)?.message ?? "Unknown error" })
			);
		} finally {
			console.log("[useConnectionForm] handleCustomOauth - Finally block");
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
		console.log("[useConnectionForm] useEffect triggered:", {
			connectionId,
			mode,
			shouldFetch: connectionId && mode === "edit",
		});
		if (connectionId && mode === "edit") {
			console.log("[useConnectionForm] useEffect - Calling fetchConnection for edit mode");
			fetchConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const setValidationSchema = (newSchema: ZodSchema) => {
		console.log("[useConnectionForm] setValidationSchema called with new schema");
		setFormSchema(newSchema);
	};

	console.log("[useConnectionForm] Returning hook values:", {
		hasControl: !!control,
		errorsCount: Object.keys(errors).length,
		errors,
		connectionId,
		connectionIntegrationName,
		connectionType,
		connectionVariablesCount: connectionVariables?.length,
		integration,
		connectionName,
		isLoading,
	});

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
		connectionType,
		connectionVariables,
		onSubmitEdit,
		integration,
		connectionName,
		setValidationSchema,
		clearErrors,
		handleCustomOauth,
		setConnectionType,
		trigger,
	};
};

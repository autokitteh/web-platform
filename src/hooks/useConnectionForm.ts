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
	useOrgConnectionsStore,
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
	onSuccessCallback?: () => void,
	isOrgConnectionProp?: boolean
) => {
	const { id: paramConnectionId, projectId } = useParams();
	const editingConnectionId = useConnectionStore((state) => state.editingConnectionId);
	const effectiveConnectionId = editingConnectionId || paramConnectionId;
	const location = useLocation();
	const isOrgConnection = isOrgConnectionProp ?? location.pathname.startsWith("/connections");
	const { currentOrganization } = useOrganizationStore();
	const orgId = currentOrganization?.id;
	const [connectionIntegrationName, setConnectionIntegrationName] = useState<string>();
	const navigate = useNavigate();
	const apiBaseUrl = getApiBaseUrl();
	const [formSchema, setFormSchema] = useState<ZodSchema>(validationSchema);
	const { startCheckingStatus, setConnectionInProgress, connectionInProgress: isLoading } = useConnectionStore();
	const { fetchConnections } = useCacheStore();
	const { fetchOrgConnections } = useOrgConnectionsStore();
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
	const [isCreating, setIsCreating] = useState(false);
	const addToast = useToastStore((state) => state.addToast);
	const { closeModal } = useModalStore();

	const getConnectionAuthType = async (connectionId: string, integrationName?: string) => {
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
			setConnectionType(connectionAuthType.value as ConnectionAuthType);
		} else if (authOptions && authOptions.length > 0 && integrationName) {
			try {
				const defaultOption = getDefaultAuthType(authOptions, integrationName as keyof typeof Integrations);
				setConnectionType(defaultOption.value as ConnectionAuthType);
			} catch {
				LoggerService.warn(
					namespaces.hooks.connectionForm,
					`getConnectionAuthType: failed to set default auth type`
				);
				// If getDefaultAuthType fails (e.g., no valid options), leave connectionType unset
				// This allows the form to maintain its current state
			}
		}
	};

	const getConnectionVariables = async (connectionId: string, integrationName?: string) => {
		const { data: vars, error } = await VariablesService.list(connectionId);
		if (error) {
			addToast({
				message: tErrors("errorFetchingVariables"),
				type: "error",
			});

			return;
		}

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
		startCheckingStatus(connId);
		if (isOrgConnection) {
			setConnectionId(undefined);
			navigate(`/connections/${connId}/edit`);

			return;
		}
		if (onSuccessCallback) {
			onSuccessCallback();
			return;
		}
		if (projectId) {
			setConnectionId(undefined);
			navigate(`/projects/${projectId}/explorer/settings/connections/${connId}/edit`);

			return;
		}
		setConnectionId(undefined);
		navigate("..");
	};

	const createConnection = async (
		connectionId: string,
		connectionAuthType: ConnectionAuthType,
		integrationName?: string
	): Promise<void> => {
		try {
			setIsCreating(true);
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
				formSchema as ZodObject<ZodRawShape> | ZodEffects<any>,
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
			handleConnectionSuccess(connectionId);
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
		} finally {
			setIsCreating(false);
			setConnectionInProgress(false);
		}
	};

	const editConnection = async (connectionId: string, integrationName?: string): Promise<void> => {
		try {
			setConnectionInProgress(true);
			if (connectionType) {
				const { error } = await VariablesService.setByConnectiontId(connectionId!, {
					name: "auth_type",
					value: connectionType,
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
				formSchema as ZodObject<ZodRawShape> | ZodEffects<any>,
				integrationName!
			);

			await HttpService.post(
				`/${formattedIntegrationName}/save?cid=${connectionId}&origin=web&auth_type=${connectionType}`,
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
			handleConnectionSuccess(connectionId);
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

			await getConnectionAuthType(connectionId, connectionResponse?.integrationUniqueName);
			await getConnectionVariables(connectionId, connectionResponse?.integrationUniqueName);
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
			setIsCreating(true);
			setConnectionInProgress(true);
			const {
				connectionName,
				integration: { value: integrationName },
			} = getValues();

			const integrationUniqueName = GoogleIntegrationsPrefixRequired.includes(integrationName)
				? `${defaultGoogleConnectionName}${integrationName}`
				: integrationName;

			let responseConnectionId: string | undefined;
			let error: unknown;
			if (isOrgConnection && orgId) {
				const result = await ConnectionService.createOrg(orgId, integrationUniqueName, connectionName);
				responseConnectionId = result.data;
				error = result.error;
			} else if (projectId) {
				const result = await ConnectionService.create(projectId, integrationUniqueName, connectionName);
				responseConnectionId = result.data;
				error = result.error;
			} else {
				setConnectionInProgress(false);
				addToast({
					message: tErrors("connectionNotCreated"),
					type: "error",
				});
				return;
			}

			if (error) {
				setConnectionInProgress(false);
				addToast({
					message: tErrors("connectionNotCreated"),
					type: "error",
				});

				return;
			}

			if (isOrgConnection && orgId) {
				await fetchOrgConnections(orgId);
			} else if (projectId) {
				await fetchConnections(projectId, true);
			}

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
		} finally {
			setIsCreating(false);
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
		const connectionData = getValues();
		try {
			setIsCreating(true);
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

			const urlParams = getSpecificParams(
				connectionData,
				integrationDataKeys[integrationName.toString() as keyof typeof integrationDataKeys]
			);

			const OauthUrl = `${apiBaseUrl}/${formattedIntegrationName}/save?cid=${oauthConnectionId}&origin=web&auth_type=${oauthType}&${urlParams}`;

			openPopup(OauthUrl, "Authorize");
			handleConnectionSuccess(oauthConnectionId);
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
			setIsCreating(false);
			setConnectionInProgress(false);
		}
	};

	const handleLegacyOAuth = async (oauthConnectionId: string, integrationName: keyof typeof Integrations) => {
		const oauthType = ConnectionAuthType.Oauth;
		try {
			setIsCreating(true);
			setConnectionInProgress(true);
			await VariablesService.setByConnectiontId(oauthConnectionId!, {
				name: "auth_type",
				value: oauthType,
				isSecret: false,
				scopeId: oauthConnectionId,
			});

			const OauthUrl = `${apiBaseUrl}/oauth/start/${integrationName}?cid=${oauthConnectionId}&origin=web&auth_type=${oauthType}`;

			openPopup(OauthUrl, "Authorize");
			handleConnectionSuccess(oauthConnectionId);
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
			setIsCreating(false);
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
			setIsCreating(true);
			setConnectionInProgress(true);
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
			const urlParams = getSpecificParams(
				connectionData,
				integrationDataKeys[integrationName.toString() as keyof typeof integrationDataKeys]
			);

			const customURLPath = integrationsCustomOAuthPaths[integrationName as keyof typeof Integrations] || "save";

			openPopup(
				`${apiBaseUrl}/${formattedIntegrationName}/${customURLPath}?cid=${oauthConnectionId}&origin=web&auth_type=${authType}&${urlParams}`,
				"Authorize"
			);
			handleConnectionSuccess(oauthConnectionId);
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
			setIsCreating(false);
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

	const setValidationSchema = (newSchema: ZodSchema) => {
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
		isCreating,
		setConnectionId,
	};
};

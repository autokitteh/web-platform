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
import { getValidationSchema } from "@src/constants/connections";
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
import { connectionSchema } from "@validations/connection.schema";

const GoogleIntegrationsPrefixRequired = [
	Integrations.sheets,
	Integrations.calendar,
	Integrations.drive,
	Integrations.forms,
];

export const useConnectionForm = (mode: FormMode) => {
	const { connectionId: paramConnectionId, projectId } = useParams();
	const [connectionIntegrationName, setConnectionIntegrationName] = useState<Integrations>();

	const navigate = useNavigate();
	const apiBaseUrl = getApiBaseUrl();
	const [formSchema, setFormSchema] = useState<ZodObject<ZodRawShape>>(connectionSchema);
	const { startCheckingStatus, setConnectionInProgress, connectionInProgress: isLoading } = useConnectionStore();
	const [connectionCreationInProgress, setConnectionCreationInProgress] = useState(false);
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

	const [editConnectionType, setEditConnectionType] = useState<string>();
	const [addConnectionType, setAddConnectionType] = useState<SingleValue<SelectOption>>();
	const [connectionVariables, setConnectionVariables] = useState<Variable[]>();
	const [connectionName, setConnectionName] = useState<string>();
	const [integration, setIntegration] = useState<SingleValue<SelectOption>>();
	const addToast = useToastStore((state) => state.addToast);
	const { closeModal } = useModalStore();

	const configureConnection = async (connectionId: string) => {
		if (!addConnectionType?.value || !integration) return;

		const integrationName = integration.value as keyof typeof Integrations;

		switch (addConnectionType.value) {
			case ConnectionAuthType.OauthDefault:
				await handleOAuth(connectionId, integrationName);
				break;
			case ConnectionAuthType.Oauth:
				await handleLegacyOAuth(connectionId, integrationName);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(connectionId, integrationName, ConnectionAuthType.OauthPrivate);
				break;
			default:
				await handleConnectionConfig(
					connectionId,
					addConnectionType.value as ConnectionAuthType,
					integrationName
				);
				break;
		}
	};

	useEffect(() => {
		if (!paramConnectionId || mode !== "edit") return;

		fetchConnection(paramConnectionId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paramConnectionId]);

	useEffect(() => {
		if (!addConnectionType?.value || !integration) return;
		const integrationName = integration.value as keyof typeof Integrations;

		const integrationSchema = getValidationSchema(
			integrationName,
			addConnectionType.value as unknown as ConnectionAuthType
		);

		if (!integrationSchema) return;

		const combinedSchema = connectionSchema.merge(integrationSchema);
		setFormSchema(combinedSchema);
	}, [addConnectionType, integration]);

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

			if (error || !connectionResponse) {
				addToast({
					message: tErrors("errorFetchingConnection", { connectionId }),
					type: "error",
				});
			}

			if (!connectionResponse?.integrationUniqueName) {
				const message = tErrors("errorGettingConnectionUniqueName", {
					connectionId,
					integrationUniqueName: connectionResponse?.integrationUniqueName,
				});
				LoggerService.error(namespaces.hooks.connectionForm, message);
				return;
			}

			const isValidIntegration = Object.values(Integrations).includes(
				connectionResponse.integrationUniqueName as Integrations
			);

			if (isValidIntegration) {
				setConnectionIntegrationName(connectionResponse?.integrationUniqueName as Integrations);
			} else {
				const message = tErrors("errorGettingConnectionUniqueName", {
					connectionId,
					integrationUniqueName: connectionResponse?.integrationUniqueName,
				});
				LoggerService.error(namespaces.hooks.connectionForm, message);
			}

			setConnectionName(connectionResponse.name);
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
		setConnectionInProgress(true);
		setConnectionCreationInProgress(true);
		try {
			if (!addConnectionType?.value || !integration) return;

			const { connectionName } = getValues();

			const integrationName = integration.value as keyof typeof Integrations;

			const integrationUniqueName = GoogleIntegrationsPrefixRequired.includes(integrationName as Integrations)
				? `${defaultGoogleConnectionName}${integrationName}`
				: integrationName;

			const { data: responseConnectionId, error } = await ConnectionService.create(
				projectId!,
				integrationUniqueName,
				connectionName
			);

			if (error || !responseConnectionId) {
				addToast({
					message: tErrors("connectionNotCreated"),
					type: "error",
				});

				return;
			}

			LoggerService.info(
				namespaces.hooks.connectionForm,
				t("connectionUpdatedSuccessExtended", { connectionName, connectionId: responseConnectionId })
			);

			await configureConnection(responseConnectionId);
			await fetchConnections(projectId!, true);
			setConnectionCreationInProgress(false);
		} catch (error) {
			setConnectionInProgress(false);
			addToast({
				message: tErrors("connectionNotCreated"),
				type: "error",
			});
			LoggerService.error(namespaces.hooks.connectionForm, tErrors("connectionNotCreatedExtended", { error }));
		}
		setConnectionInProgress(false);
	};

	const onSubmit = async () => {
		if (!formSchema) {
			addToast({
				message: tErrors("pleaseSelectConnectionType"),
				type: "error",
			});
			return;
		}
		if (!paramConnectionId) {
			createNewConnection();
			return;
		}
	};

	const onSubmitEdit = async () => {
		closeModal(ModalName.warningDeploymentActive);
		editConnection(paramConnectionId!, connectionIntegrationName);
	};

	const handleConnectionConfig = async (
		connectionId: string,
		connectionAuthType: ConnectionAuthType,
		integrationName?: string
	): Promise<void> => {
		setConnectionInProgress(true);
		try {
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
		setConnectionInProgress(false);
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
	return {
		control,
		errors,
		handleSubmit,
		onSubmit,
		register,
		watch,
		isLoading,
		handleConnectionConfig,
		handleOAuth,
		handleLegacyOAuth,
		getValues,
		setValue,
		fetchConnection,
		connectionIntegrationName,
		reset,
		editConnectionType,
		connectionVariables,
		onSubmitEdit,
		integration,
		setIntegration,
		connectionName,
		clearErrors,
		handleCustomOauth,
		setEditConnectionType,
		addConnectionType,
		setAddConnectionType,
		connectionCreationInProgress,
	};
};

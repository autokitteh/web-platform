import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { FieldValues, UseFormGetValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";
import { ZodObject, ZodRawShape } from "zod";

import { ConnectionService, HttpService, LoggerService, VariablesService } from "@services";
import { namespaces } from "@src/constants";
import { ConnectionAuthType } from "@src/enums";
import { Integrations, ModalName, defaultGoogleConnectionName, isGoogleIntegration } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { useConnectionCheckerStore, useModalStore, useToastStore } from "@src/store";
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
	const { startCheckingStatus } = useConnectionCheckerStore();

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
	const [connectionType, setConnectionType] = useState<string>();
	const [connectionVariables, setConnectionVariables] = useState<Variable[]>();
	const [isLoading, setIsLoading] = useState(false);
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
			setConnectionType(connectionAuthType.value);
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
		const formattedIntegrationName =
			integrationName && isGoogleIntegration(stripGoogleConnectionName(integrationName) as Integrations)
				? defaultGoogleConnectionName
				: integrationName;

		return { connectionData, formattedIntegrationName };
	};

	const getSpecificParams = (connectionData: Record<string, string>, specificKeys: string[]) => {
		return specificKeys
			.map((key) => (connectionData[key] ? `${key}=${connectionData[key]}` : ""))
			.filter((param) => param !== "")
			.join("&");
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

			const { connectionData, formattedIntegrationName } = getFormattedConnectionData(
				getValues,
				formSchema,
				integrationName
			);

			await HttpService.post(`/${formattedIntegrationName}/save?cid=${connectionId}&origin=web`, connectionData);
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
			if (axios.isAxiosError(error)) {
				LoggerService.error(
					namespaces.hooks.connectionForm,
					tErrors("errorCreatingNewConnectionExtended", { error: error?.response?.data })
				);
				setIsLoading(false);

				return;
			}
			LoggerService.error(
				namespaces.hooks.connectionForm,
				tErrors("errorCreatingNewConnectionExtended", { error })
			);
		} finally {
			setIsLoading(false);
		}
	};

	const editConnection = async (connectionId: string, integrationName?: string): Promise<void> => {
		setIsLoading(true);
		if (connectionType) {
			VariablesService.setByConnectiontId(connectionId!, {
				name: "auth_type",
				value: connectionType,
				isSecret: false,
				scopeId: connectionId,
			});
		}

		const { connectionData, formattedIntegrationName } = getFormattedConnectionData(
			getValues,
			formSchema,
			integrationName!
		);

		try {
			await HttpService.post(`/${formattedIntegrationName}/save?cid=${connectionId}&origin=web`, connectionData);

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
			if (axios.isAxiosError(error)) {
				LoggerService.error(
					namespaces.hooks.connectionForm,
					tErrors("errorEditingNewConnectionExtended", { error: error?.response?.data })
				);
				setIsLoading(false);

				return;
			}
			addToast({
				message: tErrors("errorEditingNewConnection"),
				type: "error",
			});
			LoggerService.error(
				namespaces.hooks.connectionForm,
				tErrors("errorEditingNewConnectionExtended", { error })
			);

			setIsLoading(false);
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

				return;
			}

			setConnectionIntegrationName(connectionResponse!.integrationUniqueName as string);
			setConnectionName(connectionResponse!.name);
			setIntegration({
				label: connectionResponse!.integrationName!,
				value: connectionResponse!.integrationUniqueName!,
			});

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
			setIsLoading(true);
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
			}

			LoggerService.info(
				namespaces.hooks.connectionForm,
				t("connectionUpdatedSuccessExtended", { connectionName, connectionId: responseConnectionId })
			);

			setConnectionId(responseConnectionId);
		} catch (error) {
			addToast({
				message: tErrors("connectionNotCreated"),
				type: "error",
			});
			LoggerService.error(namespaces.hooks.connectionForm, tErrors("connectionNotCreatedExtended", { error }));
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
		closeModal(ModalName.warningDeploymentActive);
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

			const { connectionData } = getFormattedConnectionData(getValues, formSchema);
			const specificKeys = ["auth_scopes", "cal_id", "form_id"];

			const urlParams = getSpecificParams(connectionData, specificKeys);

			openPopup(
				`${apiBaseUrl}/${defaultGoogleConnectionName}/save?cid=${oauthConnectionId}&origin=web&auth_type=oauth&${urlParams}`,
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
			setIsLoading(false);
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
		setConnectionType,
	};
};

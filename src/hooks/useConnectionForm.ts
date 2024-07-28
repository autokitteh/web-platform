import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import randomatic from "randomatic";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { baseUrl, namespaces } from "@constants";
import { ConnectionService, HttpService, LoggerService, VariablesService } from "@services";
import { Connection } from "@type/models";

import { useToastStore } from "@store";

export const useConnectionForm = (initialValues: any, validationSchema: any) => {
	const { t: tErrors } = useTranslation("errors");
	const { projectId } = useParams();
	const addToast = useToastStore((state) => state.addToast);
	const navigate = useNavigate();

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

	const [connectionId, setConnectionId] = useState<string>();
	const [_connection, setConnection] = useState<Connection>();
	const [isLoading, setIsLoading] = useState(false);
	const [webhookUrl, setWebhookUrl] = useState<string>("");

	const fetchConnection = async (id: string) => {
		try {
			const { data: connectionResponse, error } = await ConnectionService.get(id);

			if (error) {
				const errorMessage = tErrors("errorFetchingConnection");
				addToast({ id: Date.now().toString(), message: errorMessage, type: "error" });
				LoggerService.error(
					namespaces.connectionService,
					tErrors("errorFetchingConnectionExtended", { error: (error as Error).message })
				);

				return;
			}

			if (connectionResponse) {
				setConnection(connectionResponse);
				setValue("connectionName", connectionResponse.name);
				setValue("integration", {
					label: connectionResponse.integrationName,
					value: connectionResponse.integrationUniqueName,
				});
			}
		} catch (error) {
			const errorMessage = tErrors("errorFetchingConnection");
			addToast({ id: Date.now().toString(), message: errorMessage, type: "error" });
			LoggerService.error(
				namespaces.connectionService,
				tErrors("errorFetchingConnectionExtended", { error: error?.response?.data })
			);
		}
	};

	const onSubmit = async () => {
		if (!connectionId) {
			try {
				const { connectionName, integration } = getValues();
				const { data: connectionId, error } = await ConnectionService.create(
					projectId!,
					integration.value,
					connectionName
				);

				if (error) {
					const errorMessage = tErrors("errorCreatingNewConnection");
					addToast({ id: Date.now().toString(), message: errorMessage, type: "error" });
					LoggerService.error(
						namespaces.connectionService,
						tErrors("errorCreatingNewConnectionExtended", { error })
					);

					return;
				}
				if (!connectionId) {
					const errorMessage = tErrors("errorCreatingNewConnection");
					addToast({ id: Date.now().toString(), message: errorMessage, type: "error" });
					LoggerService.error(namespaces.connectionService, errorMessage);

					return;
				}

				setConnectionId(connectionId);
			} catch (error) {
				const errorMessage = tErrors("errorCreatingNewConnection");
				addToast({ id: Date.now().toString(), message: errorMessage, type: "error" });
				LoggerService.error(
					namespaces.connectionService,
					tErrors("errorCreatingNewConnectionExtended", { error })
				);
			}
		}
	};

	const createPatConnection = async (patConnectionId: string) => {
		setIsLoading(true);
		const { pat, webhookSecret: secret } = getValues();

		try {
			await HttpService.post(`/github/save?cid=${patConnectionId}&origin=web`, {
				pat,
				secret,
				webhook: webhookUrl,
			});
			const successMessage = t("connectionCreatedSuccessfully");
			addToast({ id: Date.now().toString(), message: successMessage, type: "success" });
			LoggerService.info(namespaces.connectionService, successMessage);
			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			const errorMessage = error.response?.data || tErrors("errorCreatingNewConnection");
			addToast({ id: Date.now().toString(), message: errorMessage, type: "error" });
			LoggerService.error(
				namespaces.connectionService,
				tErrors("errorCreatingNewConnectionExtended", { error: errorMessage })
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGithubOAuth = async (oauthConnectionId: string) => {
		try {
			window.open(`${baseUrl}/oauth/start/github?cid=${oauthConnectionId}&origin=web`, "_blank");
			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			const errorMessage = error?.response?.data || tErrors("errorCreatingNewConnection");
			addToast({ id: Date.now().toString(), message: errorMessage, type: "error" });
			LoggerService.error(
				namespaces.connectionService,
				tErrors("errorCreatingNewConnectionExtended", { error: errorMessage })
			);
		} finally {
			setIsLoading(false);
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			addToast({ id: Date.now().toString(), message: t("github.copySuccess"), type: "success" });
		} catch (error) {
			addToast({ id: Date.now().toString(), message: t("github.copyFailure"), type: "error" });
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
			setValue("pat", isConnectionTypePat ? "***********" : "");
			setValue("webhookSecret", isConnectionTypePat ? "***********" : "");
		}
	};

	useEffect(() => {
		if (connectionId) {
			fetchConnection(connectionId);
			fetchVariables(connectionId);
		}
		const randomForPATWebhook = randomatic("Aa0", 8);
		setWebhookUrl(`${baseUrl}/${randomForPATWebhook}`);
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
		createPatConnection,
		handleGithubOAuth,
		onSubmit,
		setValue,
		connectionId,
		fetchConnection,
	};
};

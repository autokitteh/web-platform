// useFetchConnections.js
import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { namespaces } from "@constants";
import { ConnectionService, LoggerService } from "@services";
import { SelectOption } from "@src/interfaces/components";
import { ServiceResponseError } from "@src/types";

import { useToastStore } from "@store";

export const useFetchConnections = (projectId: string, schedulerTriggerConnectionName: string) => {
	const [connections, setConnections] = useState<SelectOption[]>([]);
	const [cronConnectionId, setCronConnectionId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const addToast = useToastStore((state) => state.addToast);
	const { t: tErrors } = useTranslation(["errors", "services"]);
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });

	const handleErrors = (
		error: ServiceResponseError,
		toastMessage: string,
		logMessage = toastMessage,
		logExtendedMessage = logMessage
	) => {
		addToast({
			id: Date.now().toString(),
			message: tErrors(toastMessage),
			type: "error",
		});
		if (!error) {
			return;
		}
		LoggerService.error(
			namespaces.connectionService,
			tErrors(logExtendedMessage, { projectId, error: (error as Error)?.message })
		);
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data: allConnectionsPerCustomer, error: allConnectionsError } = await ConnectionService.list();
				if (!allConnectionsPerCustomer || !allConnectionsPerCustomer.length || allConnectionsError) {
					handleErrors(
						allConnectionsError,
						"connectionsNotFound",
						"connectionsFetchError",
						"connectionsFetchErrorExtended"
					);

					return;
				}

				const cronConnection = allConnectionsPerCustomer.find(
					(item) => item.name === schedulerTriggerConnectionName
				);
				if (!cronConnection) {
					handleErrors(null, "connectionCronNotFound");

					return;
				}
				setCronConnectionId(cronConnection.connectionId);

				const { data: allConnectionsPerProject, error: connectionsError } =
					await ConnectionService.listByProjectId(projectId);
				if (!allConnectionsPerProject || connectionsError) {
					handleErrors(connectionsError, "connectionsFetchError", "connectionsFetchErrorExtended");

					return;
				}

				const formattedConnections = allConnectionsPerProject.map((item) => ({
					label: item.name,
					value: item.connectionId,
				}));

				setConnections([
					{ label: t("cronSchedulerConnectionTitle"), value: cronConnection.connectionId },
					...formattedConnections,
				]);
			} catch (error) {
				handleErrors(error, "connectionsFetchError", "connectionsFetchErrorExtended");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	return { connections, cronConnectionId, isLoading };
};

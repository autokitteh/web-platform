// useFetchConnections.js
import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { ConnectionService } from "@services";
import { SelectOption } from "@src/interfaces/components";

import { useToastAndLog } from "@hooks";

export const useFetchConnections = (projectId: string, schedulerTriggerConnectionName: string) => {
	const [connections, setConnections] = useState<SelectOption[]>([]);
	const [cronConnectionId, setCronConnectionId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const toastAndLog = useToastAndLog("errors", "services");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data: allConnectionsPerCustomer, error: allConnectionsError } = await ConnectionService.list();
				if (!allConnectionsPerCustomer || !allConnectionsPerCustomer.length || allConnectionsError) {
					toastAndLog("error", "connectionsFetchError", allConnectionsError);

					return;
				}

				const cronConnection = allConnectionsPerCustomer.find(
					(item) => item.name === schedulerTriggerConnectionName
				);
				if (!cronConnection) {
					toastAndLog("error", "connectionCronNotFound");

					return;
				}
				setCronConnectionId(cronConnection.connectionId);

				const { data: allConnectionsPerProject, error: connectionsError } =
					await ConnectionService.listByProjectId(projectId);
				if (!allConnectionsPerProject || connectionsError) {
					toastAndLog("error", "connectionsFetchError", connectionsError);

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
				toastAndLog("error", "connectionsFetchError", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	return { connections, cronConnectionId, isLoading };
};

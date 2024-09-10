// useFetchConnections.js
import { useEffect, useState } from "react";

import { ConnectionService } from "@services";
import { extraTriggerTypes } from "@src/constants";
import { SelectOption } from "@src/interfaces/components";

import { useToastAndLog } from "@hooks";

export const useFetchConnections = (projectId: string) => {
	const [connections, setConnections] = useState<SelectOption[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const toastAndLog = useToastAndLog("services", "errors");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data: allConnectionsPerProject, error: connectionsError } =
					await ConnectionService.listByProjectId(projectId);
				if (connectionsError) {
					toastAndLog("error", "connectionsFetchError", connectionsError);

					return;
				}
				if (!allConnectionsPerProject) {
					toastAndLog("error", "connectionsNotFound", connectionsError);

					return;
				}

				const formattedConnections = allConnectionsPerProject.map((item) => ({
					label: item.name,
					value: item.connectionId,
				}));

				setConnections([...extraTriggerTypes, ...formattedConnections]);
			} catch (error) {
				toastAndLog("error", "connectionsFetchError", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	return { connections, isLoading };
};

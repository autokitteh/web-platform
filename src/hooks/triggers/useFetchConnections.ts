import { useEffect, useState } from "react";

import { extraTriggerTypes } from "@src/constants";
import { SelectOption } from "@src/interfaces/components";
import { useCacheStore } from "@src/store/cache/useCacheStore";

import { useToastAndLog } from "@hooks";

export const useFetchConnections = (projectId: string) => {
	const [connections, setConnections] = useState<SelectOption[]>([]);
	const toastAndLog = useToastAndLog("services", "errors");
	const {
		fetchConnections,
		loading: { connections: isLoading },
	} = useCacheStore();

	useEffect(() => {
		const fetchData = async () => {
			const allConnectionsPerProject = await fetchConnections(projectId);

			if (!allConnectionsPerProject) {
				toastAndLog("error", "connectionsNotFound");

				return;
			}

			const formattedConnections = allConnectionsPerProject.map((item) => ({
				label: item.name,
				value: item.connectionId,
			}));

			setConnections([...extraTriggerTypes, ...formattedConnections]);
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	return { connections, isLoading };
};

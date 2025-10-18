import React from "react";

import { useTranslation } from "react-i18next";

import { useCacheStore } from "@src/store";

export const ProjectConfigConnections = () => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "connections" });
	const connections = useCacheStore((state) => state.connections);

	return (
		<div className="space-y-2 p-2">
			<div className="mb-2 text-base font-medium text-white">{t("title")}</div>
			{connections && connections.length > 0 ? (
				connections.map((connection) => (
					<div
						className="flex cursor-pointer flex-row items-center gap-1 rounded-lg border border-gray-700 bg-gray-900 p-2"
						key={connection.connectionId}
					>
						<div className="min-w-0 flex-1">
							<div className="truncate font-medium text-white">
								{connection.name || connection.integrationId}
							</div>
						</div>

						<div className="flex size-6 items-center justify-center text-sm">
							{connection.status === "ok" ? (
								<span className="text-green-500">✓</span>
							) : (
								<span className="text-red-500">✗</span>
							)}
						</div>
					</div>
				))
			) : (
				<div className="text-gray-400">{t("noConnectionsFound")}</div>
			)}
		</div>
	);
};

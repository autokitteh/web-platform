import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useCacheStore } from "@src/store";

import { Button, IconSvg } from "@components/atoms";
import { Accordion } from "@components/molecules";

export const ProjectConfigConnections = () => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "connections" });
	const connections = useCacheStore((state) => state.connections);
	const navigate = useNavigate();
	const { projectId } = useParams();
	return (
		<Accordion hideDivider title={`${t("title")} (${connections?.length || 0})`}>
			<div className="space-y-2">
				{connections && connections.length > 0 ? (
					connections.map((connection) => (
						<Button
							className="flex w-full flex-row items-center gap-1 rounded-lg border border-gray-700 bg-gray-900 p-2"
							key={connection.connectionId}
							onClick={() =>
								navigate(`/projects/${projectId}/connections/${connection.connectionId}/edit`)
							}
						>
							{connection.logo ? <IconSvg src={connection.logo} /> : null}
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
						</Button>
					))
				) : (
					<div className="text-gray-400">{t("noConnectionsFound")}</div>
				)}
			</div>
		</Accordion>
	);
};

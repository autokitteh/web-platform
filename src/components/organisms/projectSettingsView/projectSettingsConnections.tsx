import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { useModalStore, useCacheStore } from "@src/store";

import { Button, IconButton, IconSvg } from "@components/atoms";
import { Accordion, DropdownButton } from "@components/molecules";

import { MoreIcon } from "@assets/image";
import { CirclePlusIcon, ConnectionUnplugIcon, EditIcon, TrashIcon } from "@assets/image/icons";

interface ProjectSettingsConnectionsProps {
	onOperation?: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
}

export const ProjectSettingsConnections = ({ onOperation }: ProjectSettingsConnectionsProps) => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "connections" });
	const { t: tConnections } = useTranslation("tabs", { keyPrefix: "connections" });
	const connections = useCacheStore((state) => state.connections);
	const navigate = useNavigate();
	const { projectId } = useParams();
	const { openModal } = useModalStore();

	const handleDeleteConnection = useCallback(
		(connectionId: string) => {
			if (onOperation) {
				onOperation("connection", "delete", connectionId);
			} else {
				openModal(ModalName.deleteConnection, connectionId);
			}
		},
		[onOperation, openModal]
	);

	const handleEditConnection = useCallback(
		(connectionId: string) => {
			if (onOperation) {
				onOperation("connection", "edit", connectionId);
			} else {
				navigate(`/projects/${projectId}/connections/${connectionId}/edit`);
			}
		},
		[onOperation, projectId, navigate]
	);

	const handleAddConnection = useCallback(() => {
		if (onOperation) {
			onOperation("connection", "add");
		} else {
			navigate(`/projects/${projectId}/connections/add`);
		}
	}, [onOperation, projectId, navigate]);

	return (
		<Accordion
			closeIcon={ConnectionUnplugIcon}
			hideDivider
			openIcon={ConnectionUnplugIcon}
			title={`${t("title")} (${connections?.length || 0})`}
		>
			<div className="space-y-2">
				{connections && connections.length > 0 ? (
					connections.map((connection) => (
						<div
							className="group relative flex flex-row items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 p-2"
							key={connection.connectionId}
						>
							{connection.logo ? <IconSvg src={connection.logo} /> : null}
							<div className="ml-0.5 min-w-0 flex-1">
								<div className="truncate font-medium text-white">
									{connection.name || connection.integrationId}
								</div>
								<div className="flex text-xs text-gray-400">
									<span className="truncate">{connection.statusInfoMessage}</span>
								</div>
							</div>

							<div className="flex size-6 items-center justify-center text-sm">
								{connection.status === "ok" ? (
									<span className="text-green-500">✓</span>
								) : (
									<span className="text-red-500">✗</span>
								)}
							</div>
							<DropdownButton
								ariaLabel={tConnections("table.buttons.ariaModifyConnection", {
									name: connection.name,
								})}
								contentMenu={
									<div className="flex flex-col gap-1">
										<button
											aria-label={tConnections("table.buttons.ariaModifyConnection", {
												name: connection.name,
											})}
											className="ml-0.5 flex h-8 w-160 items-center gap-2 justify-self-auto px-1 hover:text-green-800"
											onClick={() => handleEditConnection(connection.connectionId!)}
											type="button"
										>
											<EditIcon className="size-3 fill-white" />
											<span className="text-sm">{t("actions.edit")}</span>
										</button>
										<button
											aria-label={tConnections("table.buttons.ariaDeleteConnection", {
												name: connection.name,
											})}
											className="flex h-8 w-160 items-center gap-2 justify-self-auto px-1 hover:text-green-800"
											onClick={() => handleDeleteConnection(connection.connectionId!)}
											type="button"
										>
											<TrashIcon className="size-4 stroke-white" />
											<span className="text-sm">{t("actions.delete")}</span>
										</button>
									</div>
								}
							>
								<IconButton ariaLabel={t("actions.more")} className="size-8">
									<IconSvg
										className="fill-white transition group-hover:fill-green-200 group-active:fill-green-800"
										size="md"
										src={MoreIcon}
									/>
								</IconButton>
							</DropdownButton>
						</div>
					))
				) : (
					<div className="text-gray-400">{t("noConnectionsFound")}</div>
				)}
				<div className="flex w-full justify-end">
					<Button
						ariaLabel="Add Connection"
						className="group !p-0 hover:bg-transparent hover:font-semibold"
						onClick={handleAddConnection}
					>
						<CirclePlusIcon className="size-3 stroke-green-800 stroke-[1.225] transition-all group-hover:stroke-[2]" />
						<span className="text-sm text-green-800">Add</span>
					</Button>
				</div>
			</div>
		</Accordion>
	);
};

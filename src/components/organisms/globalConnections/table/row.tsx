import React, { memo } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Integrations } from "@src/enums/components";
import { cn } from "@src/utilities";
import { Connection } from "@type/models";

import { IconButton, Td, Tr } from "@components/atoms";
import { ConnectionItemDisplay } from "@components/organisms/configuration/connections/connectionItemDisplay";
import { ConnectionStatusButton } from "@components/organisms/configuration/connections/connectionStatusButton";

import { SettingsIcon, TrashIcon } from "@assets/image/icons";

export const ConnectionRow = memo(
	({
		connection,
		onConfigure,
		onDelete,
	}: {
		connection: Connection;
		onConfigure: () => void;
		onDelete?: () => void;
	}) => {
		const { t } = useTranslation("connections");
		const { id: paramConnectionId } = useParams();

		const rowClass = cn("group flex cursor-pointer items-center fill-white hover:bg-gray-1300", {
			"bg-black": paramConnectionId === connection.connectionId,
		});

		const handleConfigureClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			onConfigure();
		};

		const handleDeleteClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			onDelete?.();
		};

		const hasError = connection.status !== "ok";
		const errorMessage = hasError ? connection.statusInfoMessage : undefined;

		const statusClass = cn({
			"text-green-500": connection.status === "ok",
			"text-yellow-500": connection.status === "warning",
			"text-error-200": connection.status === "error",
		});

		return (
			<Tr ariaLabel={`${connection.name}`} className={rowClass} onClick={onConfigure}>
				<Td ariaLabel={connection.name} className="w-1/2 min-w-32 pl-4">
					<ConnectionItemDisplay
						item={{
							id: connection.connectionId,
							icon: connection.logo,
							name: connection.name,
							integration: (connection.integrationUniqueName as Integrations) ?? "",
						}}
					/>
				</Td>
				<Td ariaLabel={connection.status} className="w-1/4 min-w-32 text-center">
					<div className="flex w-full justify-center">
						{hasError ? (
							<ConnectionStatusButton errorMessage={errorMessage} onInitClick={onConfigure} />
						) : (
							<span className={statusClass}>{connection.status}</span>
						)}
					</div>
				</Td>
				<Td ariaLabel={t("table.columns.actions")} className="w-1/5 min-w-20 text-center">
					<div className="flex w-full justify-center">
						<IconButton
							ariaLabel={`Configure ${connection.name}`}
							onClick={handleConfigureClick}
							title={t("actions.configure")}
						>
							<SettingsIcon className="size-4 fill-white transition group-hover:fill-green-800" />
						</IconButton>

						{onDelete ? (
							<IconButton
								ariaLabel={`Delete ${connection.name}`}
								className="ml-1"
								onClick={handleDeleteClick}
								title={t("actions.delete")}
							>
								<TrashIcon className="size-4 stroke-white transition hover:stroke-error" />
							</IconButton>
						) : null}
					</div>
				</Td>
			</Tr>
		);
	}
);

ConnectionRow.displayName = "ConnectionRow";

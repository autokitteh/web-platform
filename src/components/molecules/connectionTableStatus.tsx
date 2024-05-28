import React from "react";
import { ConnectionStatus } from "@enums";
import { ConnectionStatusType } from "@type/models";
import { useTranslation } from "react-i18next";

export const ConnectionTableStatus = ({ status }: { status: ConnectionStatusType }) => {
	const { t } = useTranslation("tabs");
	const connectionTableStatusClass = {
		[ConnectionStatus.unspecified]: "text-blue-500",
		[ConnectionStatus.ok]: "text-green-accent",
		[ConnectionStatus.warning]: "text-yellow-500",
		[ConnectionStatus.error]: "text-red",
	};
	const baseClass = connectionTableStatusClass[ConnectionStatus[status]];
	const statusName = t(`connections.table.statuses.${status}`);

	return (
		<div aria-label={statusName} className={baseClass} role="status">
			{statusName}
		</div>
	);
};

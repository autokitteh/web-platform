import React from "react";

import { useTranslation } from "react-i18next";

import { ConnectionStatus } from "@enums";
import { ConnectionStatusType } from "@type/models";

export const ConnectionTableStatus = ({ status }: { status: ConnectionStatusType }) => {
	const { t } = useTranslation("tabs");
	const connectionTableStatusClass = {
		[ConnectionStatus.error]: "text-red",
		[ConnectionStatus.ok]: "text-green-accent",
		[ConnectionStatus.unspecified]: "text-blue-500",
		[ConnectionStatus.warning]: "text-yellow-500",
	};
	const baseClass = connectionTableStatusClass[ConnectionStatus[status]];
	const statusName = t(`connections.table.statuses.${status}`);

	return (
		<div aria-label={statusName} className={baseClass} role="status">
			{statusName}
		</div>
	);
};

import React from "react";

import { useTranslation } from "react-i18next";

import { ConnectionStatus } from "@enums";
import { cn } from "@src/utilities";
import { ConnectionStatusType } from "@type/models";

export const ConnectionTableStatus = ({ status }: { status: ConnectionStatusType }) => {
	const { t } = useTranslation("tabs");
	const connectionTableStatusClass = {
		[ConnectionStatus.error]: "text-red",
		[ConnectionStatus.ok]: "text-green-800",
		[ConnectionStatus.unspecified]: "text-blue-500",
		[ConnectionStatus.warning]: "text-yellow-500",
	};
	const baseClass = cn("inline", connectionTableStatusClass[ConnectionStatus[status]]);
	const statusName = t(`connections.table.statuses.${status}`);

	return (
		<div aria-label={statusName} className={baseClass} role="status">
			{statusName}
		</div>
	);
};

import React from "react";

import { useTranslation } from "react-i18next";

import { ConnectionStatus } from "@enums/components/connectionStatus.enum";
import { connectionsColors } from "@src/constants/connections";
import { cn } from "@src/utilities";
import { ConnectionStatusType } from "@type/models";

export const ConnectionTableStatus = ({ status }: { status: ConnectionStatusType }) => {
	const { t } = useTranslation("tabs");
	const baseClass = cn(
		"flex w-[6.8rem] items-center justify-center rounded-md border border-gray-800 px-2 py-0.5 text-xs text-white",
		connectionsColors[ConnectionStatus[status]]
	);
	const statusName = t(`connections.table.statuses.${status}`);

	return (
		<div aria-label={statusName} className={baseClass} role="status">
			{statusName}
		</div>
	);
};

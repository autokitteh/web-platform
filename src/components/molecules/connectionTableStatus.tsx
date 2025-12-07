import React from "react";

import { useTranslation } from "react-i18next";

import { ConnectionStatus } from "@enums";
import { cn } from "@src/utilities";
import { ConnectionStatusType } from "@type/models";

export const ConnectionTableStatus = ({ status }: { status: ConnectionStatusType }) => {
	const { t } = useTranslation("tabs");
	const connectionTableStatusClass = {
		[ConnectionStatus.error]: "text-red hover:bg-red/10",
		[ConnectionStatus.ok]: "text-green-800 hover:bg-green-800/10",
		[ConnectionStatus.unspecified]: "text-blue-500 hover:bg-blue-500/10",
		[ConnectionStatus.warning]: "text-yellow-500 hover:bg-yellow-500/10",
		[ConnectionStatus.init_required]: "text-orange-500 hover:bg-orange-500/10",
	};
	const baseClass = cn(
		"flex w-[6.8rem] items-center justify-center rounded-md border border-gray-800 px-2 py-0.5 text-xs text-white",
		connectionTableStatusClass[ConnectionStatus[status]]
	);
	const statusName = t(`connections.table.statuses.${status}`);

	return (
		<div aria-label={statusName} className={baseClass} role="status">
			{statusName}
		</div>
	);
};

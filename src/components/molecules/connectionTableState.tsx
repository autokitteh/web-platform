import React from "react";
import { ConnectionState } from "@enums";
import i18n from "i18next";

export const ConnectionTableState = ({ connectnionState }: { connectnionState: ConnectionState }) => {
	const connectionTableStateStyles = {
		[ConnectionState.unspecified]: "text-blue-500",
		[ConnectionState.ok]: "text-green-accent",
		[ConnectionState.warning]: "text-yellow-500",
		[ConnectionState.error]: "text-red",
	};

	const baseClass = connectionTableStateStyles[connectnionState];

	const status = i18n.t(`connections.table.statuses.${ConnectionState[connectnionState]}`, { ns: "tabs" });

	return (
		<div aria-label={status} className={baseClass} role="status">
			{status}
		</div>
	);
};

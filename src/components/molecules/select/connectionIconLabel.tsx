import React from "react";

import { SelectConnectionIconLabel } from "@interfaces/components";

import { StatusIndicator } from "@components/atoms";
import { IconLabel } from "@components/molecules/select";

export const ConnectionIconLabel = ({
	icon,
	iconClassName,
	label,
	"aria-hidden": ariaHidden,
	isHighlighted,
	highlightLabel,
	connectionStatus,
}: SelectConnectionIconLabel) => {
	return (
		<div aria-label={connectionStatus?.statusInfoMessage || ""} title={connectionStatus?.statusInfoMessage || ""}>
			<IconLabel
				aria-hidden={ariaHidden}
				highlightLabel={highlightLabel}
				icon={icon}
				iconClassName={iconClassName}
				indicator={<StatusIndicator connectionStatus={connectionStatus} />}
				isHighlighted={isHighlighted}
				label={label}
			/>
		</div>
	);
};

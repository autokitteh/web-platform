import React from "react";

import { SelectIconLabel } from "@interfaces/components";

import { IconSvg } from "@components/atoms/icons";

export const IconLabel = ({
	icon,
	label,
	"aria-hidden": ariaHidden,
	isHighlighted,
	highlightLabel,
}: SelectIconLabel) => (
	<div className="flex items-center gap-2">
		{icon ? <IconSvg aria-hidden={ariaHidden} className="rounded-full bg-white p-0.5" src={icon} /> : null}

		{label}

		{isHighlighted && highlightLabel ? (
			<span className="rounded bg-green-800 px-1.5 py-0.5 text-xs font-medium text-gray-1250">
				{highlightLabel}
			</span>
		) : null}
	</div>
);

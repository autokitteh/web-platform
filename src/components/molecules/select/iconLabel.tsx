import React from "react";

import { SelectIconLabel } from "@interfaces/components";

import { IconSvg } from "@components/atoms/icons";

export const IconLabel = ({ icon, label }: SelectIconLabel) => {
	const ariaLabel = `Select icon label ${label}`;

	return (
		<div
			aria-label={ariaLabel}
			className="flex items-center gap-2"
			data-testid="select-icon-label"
			title={ariaLabel}
		>
			{icon ? <IconSvg className="rounded-full bg-white p-0.5" src={icon} /> : null}

			{label}
		</div>
	);
};

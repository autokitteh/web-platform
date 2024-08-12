import React from "react";

import { SelectIconLabel } from "@interfaces/components";

import { IconSvg } from "@components/atoms/icons";

export const IconLabel = ({ icon, label }: SelectIconLabel) => (
	<div className="flex items-center gap-2">
		{icon ? <IconSvg className="rounded-full bg-white p-0.5" src={icon} /> : null}

		{label}
	</div>
);

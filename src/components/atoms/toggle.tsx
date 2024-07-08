import React from "react";

import { ToggleProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Toggle = ({ checked, label, onChange }: ToggleProps) => {
	const baseStyle = cn(
		"relative w-10 h-5 bg-gray-300 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-gray-300",
		"after:content-[''] peer-checked:bg-green-accent after:absolute",
		"after:top-[2px] after:start-[4px] after:bg-white after:border after:rounded-full",
		"after:h-4 after:w-4 after:transition-all"
	);

	return (
		<label className="inline-flex cursor-pointer items-center">
			<input
				checked={checked}
				className="peer hidden"
				onChange={(event) => onChange(event.target.checked)}
				type="checkbox"
			/>

			<div className={baseStyle} />

			{label ? <span className="ms-3 text-sm font-medium text-white">{label}</span> : null}
		</label>
	);
};

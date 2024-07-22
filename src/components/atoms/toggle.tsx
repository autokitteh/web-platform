import React from "react";

import { ToggleProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Toggle = ({ checked, label, onChange }: ToggleProps) => {
	const baseStyle = cn(
		"relative h-5 w-10 rounded-full bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-gray-500",
		"after:absolute after:content-[''] peer-checked:bg-green-800",
		"after:start-[4px] after:top-[2px] after:rounded-full after:border after:bg-white",
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

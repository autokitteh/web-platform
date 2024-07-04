import { ToggleProps } from "@interfaces/components";
import { cn } from "@utilities";
import React from "react";

export const Toggle = ({ checked, label, onChange }: ToggleProps) => {
	const baseStyle = cn(
		"relative w-10 h-5 bg-gray-300 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-gray-300",
		"after:content-[''] peer-checked:bg-green-accent after:absolute",
		"after:top-[2px] after:start-[4px] after:bg-white after:border after:rounded-full",
		"after:h-4 after:w-4 after:transition-all"
	);

	return (
		<label className="cursor-pointer inline-flex items-center">
			<input checked={checked} className="hidden peer" onChange={(e) => onChange(e.target.checked)} type="checkbox" />

			<div className={baseStyle} />

			{label ? <span className="font-medium ms-3 text-sm text-white">{label}</span> : null}
		</label>
	);
};

import React from "react";
import { SwitchProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Switch = ({ label, className, checked, onChange }: SwitchProps) => {
	const baseStyle = cn(
		"relative w-10 h-5 bg-gray-300 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-gray-300",
		"after:content-[''] peer-checked:bg-green-accent after:absolute",
		"after:top-[2px] after:start-[4px] after:bg-white after:border after:rounded-full",
		"after:h-4 after:w-4 after:transition-all",
		className
	);

	return (
		<label className="inline-flex items-center cursor-pointer">
			<input checked={checked} className="hidden peer" onChange={(e) => onChange(e.target.checked)} type="checkbox" />
			<div className={baseStyle} />
			{label ? <span className="ms-3 text-sm font-medium text-white">{label}</span> : null}
		</label>
	);
};

import React from "react";

import { ToggleProps } from "@interfaces/components";
import { cn } from "@utilities";

import { InfoPopover } from "@components/molecules";

export const Toggle = ({ checked, label, onChange, title, description, className }: ToggleProps) => {
	const wrapperStyle = cn("inline-flex items-center gap-2", className);
	const baseStyle = cn(
		"relative h-5 w-10 rounded-full bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-gray-500",
		"after:absolute after:content-[''] peer-checked:bg-green-800",
		"after:start-[4px] after:top-[2px] after:rounded-full after:border after:bg-white",
		"after:size-4 after:transition-all"
	);

	return (
		<div className={wrapperStyle}>
			<label className="inline-flex cursor-pointer items-center" title={title}>
				<input
					checked={checked}
					className="peer hidden"
					onChange={(event) => onChange(event.target.checked)}
					type="checkbox"
				/>

				<div className={baseStyle} />
				{label ? <span className="ms-3 text-sm font-medium text-white">{label}</span> : null}
			</label>
			{description ? <InfoPopover>{description}</InfoPopover> : null}
		</div>
	);
};

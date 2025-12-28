import React from "react";

import { ToggleProps } from "@interfaces/components";
import { cn } from "@utilities";

import { InfoPopover } from "@components/molecules";

export const Toggle = ({
	checked,
	label,
	labelClass,
	labelPosition = "right",
	size = "md",
	onChange,
	title,
	description,
	className,
}: ToggleProps) => {
	const wrapperStyle = cn("inline-flex items-center gap-2", className);
	const baseStyle = cn(
		"relative rounded-full bg-gray-500 peer-checked:after:border-gray-500",
		"after:absolute after:content-[''] peer-checked:bg-green-800",
		"after:rounded-full after:border after:bg-white after:transition-all",
		size === "sm"
			? "h-4 w-8 after:start-[2px] after:top-[2px] after:size-3 peer-checked:after:translate-x-4"
			: "h-5 w-10 after:start-[4px] after:top-[2px] after:size-4 peer-checked:after:translate-x-full"
	);
	const labelStyle = cn("text-sm font-medium text-white", labelPosition === "left" ? "me-3" : "ms-3", labelClass);

	const labelElement = label ? <span className={labelStyle}>{label}</span> : null;

	return (
		<div className={wrapperStyle}>
			<label className="inline-flex cursor-pointer items-center" title={title}>
				<input
					checked={checked}
					className="peer hidden"
					onChange={(event) => onChange(event.target.checked)}
					type="checkbox"
				/>

				{labelPosition === "left" ? labelElement : null}
				<div className={baseStyle} />
				{labelPosition === "right" ? labelElement : null}
			</label>
			{description ? <InfoPopover>{description}</InfoPopover> : null}
		</div>
	);
};

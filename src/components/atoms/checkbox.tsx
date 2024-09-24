import React, { KeyboardEvent } from "react";

import { CheckboxProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

import { Check, Square } from "@assets/image/icons";

export const Checkbox = ({ checked, className, label, onChange, title }: CheckboxProps) => {
	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			onChange(!checked);
		}
	};

	const checkboxClass = cn("inline-flex cursor-pointer items-center", className);

	return (
		<label className={checkboxClass} title={title}>
			<div
				aria-checked={checked}
				className="relative flex items-center justify-center"
				onClick={() => onChange(!checked)}
				onKeyDown={handleKeyDown}
				role="checkbox"
				tabIndex={0}
			>
				{checked ? (
					<Check className="-mt-0.5 size-3.5 fill-gray-250" />
				) : (
					<Square className="-mt-0.5 size-3.5 fill-gray-250" />
				)}
			</div>

			{label ? <span className="ml-2 text-sm text-gray-250">{label}</span> : null}
		</label>
	);
};

export default Checkbox;

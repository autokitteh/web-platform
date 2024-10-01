import React, { KeyboardEvent, useId } from "react";

import { IconSvg } from "./icons";
import { CheckboxProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

import { Check, Square } from "@assets/image/icons";

export const Checkbox = ({ checked, className, label, onChange, title }: CheckboxProps) => {
	const id = useId();

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			onChange(!checked);
		}
	};

	const checkboxClass = cn("inline-flex cursor-pointer items-center h-6 justify-center px-2", className);

	return (
		<div className={checkboxClass} title={title}>
			<input
				checked={checked}
				className="sr-only"
				id={id}
				onChange={(event) => onChange(event.target.checked)}
				type="checkbox"
			/>

			<div className="relative flex select-none items-center" onKeyDown={handleKeyDown} role="presentation">
				{label ? (
					<label
						aria-checked={checked}
						className="flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-250"
						htmlFor={id}
					>
						<IconSvg className="size-3.5 fill-gray-250" src={checked ? Check : Square} />
						{label}
					</label>
				) : null}
			</div>
		</div>
	);
};

export default Checkbox;

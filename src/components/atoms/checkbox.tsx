import React, { KeyboardEvent, useId } from "react";

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

	const checkboxClass = cn("inline-flex cursor-pointer items-center", className);

	return (
		<div className={checkboxClass} title={title}>
			<input
				checked={checked}
				className="sr-only"
				id={id}
				onChange={(event) => onChange(event.target.checked)}
				type="checkbox"
			/>

			<div
				className="relative flex items-center"
				onClick={() => onChange(!checked)}
				onKeyDown={handleKeyDown}
				role="presentation"
			>
				<div aria-checked={checked} className="flex items-center justify-center" role="checkbox" tabIndex={0}>
					{checked ? (
						<Check aria-hidden="true" className="-mt-0.5 size-3.5 fill-gray-250" />
					) : (
						<Square aria-hidden="true" className="-mt-0.5 size-3.5 fill-gray-250" />
					)}
				</div>

				{label ? (
					<label className="ml-2 cursor-pointer text-sm text-gray-250" htmlFor={id}>
						{label}
					</label>
				) : null}
			</div>
		</div>
	);
};

export default Checkbox;

import React, { KeyboardEvent, useId } from "react";

import { IconSvg } from "./icons";
import { CheckboxProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Loader } from "@components/atoms/loader";

import { Check, Square } from "@assets/image/icons";

export const Checkbox = ({
	checked,
	className,
	isLoading,
	label,
	labelClassName,
	onChange,
	title,
	checkboxClassName,
}: CheckboxProps) => {
	const id = useId();

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			onChange?.(!checked);
		}
	};

	const baseClass = cn("inline-flex h-6 cursor-pointer items-center justify-center overflow-hidden px-2", className);
	const labelClass = cn(
		"flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-250",
		labelClassName
	);
	const checkboxClass = cn("size-3.5 fill-gray-250", checkboxClassName);

	return (
		<div className={baseClass} title={title}>
			<input
				checked={checked}
				className="absolute size-0 opacity-0"
				id={id}
				onChange={(event) => onChange?.(event.target.checked)}
				type="checkbox"
			/>

			<div className="relative flex select-none items-center" onKeyDown={handleKeyDown} role="presentation">
				{label ? (
					<label aria-checked={checked} className={labelClass} htmlFor={id}>
						{isLoading ? (
							<Loader size="sm" />
						) : (
							<IconSvg className={checkboxClass} src={checked ? Check : Square} />
						)}
						{label}
					</label>
				) : null}
			</div>
		</div>
	);
};

export default Checkbox;

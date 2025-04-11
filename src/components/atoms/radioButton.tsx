import React from "react";

import { RadioButtonProps } from "@src/interfaces/components";

import { IconSvg } from "@components/atoms/icons";

import { CheckMarkIcon } from "@assets/image/icons";

export const RadioButton = ({ id, name, value, checked, label, onChange, disabled }: RadioButtonProps) => {
	return (
		<div className="flex items-center hover:cursor-pointer">
			<div className="relative flex items-center">
				<input
					aria-labelledby={`${id}-label`}
					checked={checked}
					className="sr-only"
					disabled={disabled}
					id={id}
					name={name}
					onChange={onChange}
					type="radio"
					value={value}
				/>
				<div className="flex size-4 items-center justify-center overflow-hidden rounded-full border-2 border-green-500">
					{checked ? <IconSvg className="bg-green-500 stroke-white stroke-4" src={CheckMarkIcon} /> : null}
				</div>
			</div>
			<label className="ml-2 px-2 py-1 text-base font-semibold text-gray-1200" htmlFor={id} id={`${id}-label`}>
				{label}
			</label>
		</div>
	);
};

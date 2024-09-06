import { ReactNode } from "react";

import { Control } from "react-hook-form";

import { InputType } from "@type/components";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	classInput?: string;
	className?: string;
	label: string;
	disabled?: boolean;
	icon?: ReactNode;
	isError?: boolean;
	isRequired?: boolean;
	placeholder?: string;
	variant?: InputType;
}

export interface ExtendedInputProps extends InputProps {
	control?: Control<any>;
	name?: string;
}

import { ReactNode } from "react";

import { InputType } from "@typecomponents";

import { TextSizes } from "@type";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	classInput?: string;
	className?: string;
	label?: string;
	disabled?: boolean;
	icon?: ReactNode;
	isError?: boolean;
	isRequired?: boolean;
	placeholder?: string;
	variant?: InputType;
	inputLabelTextSize?: TextSizes;
	labelOverlayClassName?: string;
}

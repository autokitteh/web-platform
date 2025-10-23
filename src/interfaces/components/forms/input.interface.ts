import { ReactNode } from "react";

import { TextSizes } from "@src/types";
import { InputType } from "@type/components";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	classInput?: string;
	className?: string;
	hint?: string;
	label?: string;
	disabled?: boolean;
	icon?: ReactNode;
	isError?: boolean;
	isRequired?: boolean;
	placeholder?: string;
	variant?: InputType;
	inputLabelTextSize?: TextSizes;
	labelOverlayClassName?: string;
	isSensitive?: boolean;
}

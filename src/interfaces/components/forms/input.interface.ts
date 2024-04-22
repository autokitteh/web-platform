import { ReactNode } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	icon?: ReactNode;
	placeholder?: string;
	className?: string;
	classInput?: string;
	isError?: boolean;
	isRequired?: boolean;
	disabled?: boolean;
}

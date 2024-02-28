import { ReactNode } from "react";

export interface IInput extends React.InputHTMLAttributes<HTMLInputElement> {
	icon?: ReactNode;
	placeholder?: string;
	className?: string;
	classInput?: string;
	isError?: boolean;
	isRequired?: boolean;
	disabled?: boolean;
}

import { ReactNode } from "react";

export interface IInput extends React.InputHTMLAttributes<HTMLInputElement> {
	icon?: ReactNode;
	isError?: boolean;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
	classInput?: string;
}

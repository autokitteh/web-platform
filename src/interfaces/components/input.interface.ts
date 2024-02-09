import { ReactNode } from "react";

export interface IInput extends React.InputHTMLAttributes<HTMLInputElement> {
	icon: ReactNode;
	error: boolean;
	disabled: boolean;
	placeholder: string;
	className: string;
}

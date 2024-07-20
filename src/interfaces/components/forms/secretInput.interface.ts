import { ReactNode } from "react";

import { InputType } from "@type/components";

export interface SecretInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	classInput?: string;
	className?: string;
	disabled?: boolean;
	icon?: ReactNode;
	isError?: boolean;
	isRequired?: boolean;
	placeholder?: string;
	variant?: InputType;
	isLocked?: boolean;
	onLockClick?: () => void;
}

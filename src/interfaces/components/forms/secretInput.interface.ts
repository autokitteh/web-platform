import { UseFormRegisterReturn } from "react-hook-form";

import { InputType } from "@type/components";

export interface SecretInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	classInput?: string;
	className?: string;
	defaultValue?: string;
	disabled?: boolean;
	isError?: boolean;
	isLocked?: boolean;
	isLockedDisabled?: boolean;
	isRequired?: boolean;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onLockClick?: () => void;
	placeholder?: string;
	value?: string;
	variant?: InputType;
	register: UseFormRegisterReturn;
	onFocus?: () => void;
}

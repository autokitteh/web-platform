import { InputType } from "@type/components";

export interface SecretInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	classInput?: string;
	label?: string;
	isError?: boolean;
	isLocked: boolean;
	isLockedDisabled?: boolean;
	isRequired?: boolean;
	handleLockAction?: (lockState: boolean) => void;
	handleInputChange?: (value: string) => void;
	variant?: InputType;
	onFocus?: () => void;
	resetOnFirstFocus?: boolean;
}

import { InputType } from "@types/components";

export interface SecretInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	classInput?: string;
	label: string;
	isError?: boolean;
	isLocked: boolean;
	isLockedDisabled?: boolean;
	type?: "secret" | "password";
	isRequired?: boolean;
	handleLockAction?: (lockState: boolean) => void;
	handleInputChange?: (value: string) => void;
	variant?: InputType;
	onFocus?: () => void;
}

import { InputType } from "@type/components";

export interface SecretInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	classInput?: string;
	isError?: boolean;
	isLocked?: boolean;
	isLockedDisabled?: boolean;
	isRequired?: boolean;
	handleLockAction?: (newLockState: boolean) => void;
	handleInputChange: (newLockState: string) => void;
	variant?: InputType;
	onFocus?: () => void;
}

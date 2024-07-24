import { UseFormRegisterReturn } from "react-hook-form";

import { InputType } from "@type/components";

export interface SecretInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	classInput?: string;
	isError?: boolean;
	isLocked?: boolean;
	isLockedDisabled?: boolean;
	isRequired?: boolean;
	handleLockAction?: (newLockState: boolean) => void;
	variant?: InputType;
	register: UseFormRegisterReturn;
	onFocus?: () => void;
	resetOnFocus?: boolean;
}

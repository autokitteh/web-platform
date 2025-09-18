import { ReactNode } from "react";

import { FieldErrors, FieldValues } from "react-hook-form";

export interface AiTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	className?: string;
	submitIcon?: ReactNode;
	errors?: FieldErrors<FieldValues>;
	onSubmitIconHover?: (isHovered: boolean) => void;
	prompt: string;
}

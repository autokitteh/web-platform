import { ReactNode } from "react";

export interface AiTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	className?: string;
	onEnterSubmit?: boolean;
	onShiftEnterNewLine?: boolean;
	submitIcon?: ReactNode;
	onSubmitIconHover?: (isHovered: boolean) => void;
	hasClearedTextarea?: boolean;
	onClearTextarea?: (cleared: boolean) => void;
	defaultPlaceholderText?: string;
	autoGrow?: boolean;
	minHeightVh?: number;
	maxHeightVh?: number;
}

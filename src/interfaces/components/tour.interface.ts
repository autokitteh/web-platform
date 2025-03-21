import { ReactNode } from "react";

export interface TourPopoverProps {
	targetId: string;
	title: string | ReactNode;
	content?: string | ReactNode;
	customComponent?: ReactNode;
	placement?: "top" | "bottom" | "left" | "right";
	onPrev?: () => void;
	onSkip?: () => void;
	onNext?: () => void;
	isFirstStep?: boolean;
	isHighlighted?: boolean;
	displayNext?: boolean;
}

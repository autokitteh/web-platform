export interface TourPopoverProps {
	targetId: string;
	title: string;
	content: React.ReactNode | string;
	placement?: "top" | "bottom" | "left" | "right";
	onNext: () => void;
	onPrev: () => void;
	onSkip: () => void;
	isFirstStep: boolean;
	isLastStep: boolean;
	isHighlighted?: boolean;
}

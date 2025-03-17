export interface TourPopoverProps {
	targetId: string;
	title: string;
	content: React.ReactNode | string;
	placement?: "top" | "bottom" | "left" | "right";
	onPrev: () => void;
	onSkip: () => void;
	onNext: () => void;
	isFirstStep: boolean;
	isLastStep: boolean;
	isHighlighted?: boolean;
}

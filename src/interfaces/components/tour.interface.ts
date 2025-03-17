export interface TourPopoverProps {
	targetId: string;
	title: string;
	content: React.ReactNode | string;
	placement?: "top" | "bottom" | "left" | "right";
	onPrev: () => void;
	onSkip: () => void;
	isFirstStep: boolean;
	isHighlighted?: boolean;
}

import { ReactNode } from "react";

import { Placement } from "@floating-ui/react";

export interface TourPopoverProps {
	targetId: string;
	title: string | ReactNode;
	content?: string | ReactNode;
	customComponent?: ReactNode;
	placement?: Placement;
	onPrev?: () => void;
	onSkip?: () => void;
	onNext?: () => void;
	isFirstStep?: boolean;
	isLastStep?: boolean;
	isHighlighted?: boolean;
	displayNext?: boolean;
}

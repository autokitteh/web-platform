import { ReactNode } from "react";

import { Placement } from "@floating-ui/react";

export interface TourPopoverProps {
	htmlElementId: string;
	title?: string | ReactNode;
	content?: string | ReactNode;
	customComponent?: React.ReactElement;
	placement?: Placement;
	onPrev?: () => void;
	onSkip?: () => void;
	onNext?: (url: string) => void;
	isFirstStep?: boolean;
	isLastStep?: boolean;
	displayNext?: boolean;
	hideBack?: boolean;
	visible?: boolean;
}

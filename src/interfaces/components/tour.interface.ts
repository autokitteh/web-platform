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
	isFirstStep?: boolean;
	isLastStep?: boolean;
	hideBack?: boolean;
	visible?: boolean;
	actionButton?: {
		ariaLabel?: string;
		execute: () => void;
		label: string;
	};
}

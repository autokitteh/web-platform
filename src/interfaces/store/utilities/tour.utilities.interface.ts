import { Placement } from "@floating-ui/react";

export interface TourStepOptions {
	highlight?: boolean;
	pathPatterns?: RegExp[];
	placement?: Placement;
	hideBack?: boolean;
}
export interface CreateClickStepParams {
	htmlElementId: string;
	id: string;
	titleKey: string;
	contentKey: string;
	buttonLabelKey: string;
	buttonAriaLabelKey: string;
	options?: TourStepOptions;
}
export interface CreateRenderClickStepParams {
	htmlElementId: string;
	id: string;
	titleKey: string;
	renderContent: any;
	buttonLabelKey: string;
	buttonAriaLabelKey: string;
	options?: TourStepOptions;
}
export interface CreateRenderClickStepWithLoggingParams {
	htmlElementId: string;
	id: string;
	titleKey: string;
	renderContent: any;
	buttonLabelKey: string;
	buttonAriaLabelKey: string;
	options?: TourStepOptions;
}
export interface CreateTabClickStepParams {
	htmlElementId: string;
	id: string;
	titleKey: string;
	contentKey: string;
	buttonLabelKey: string;
	buttonAriaLabelKey: string;
	options?: TourStepOptions;
}
export interface CreateRenderStepWithActionParams {
	htmlElementId: string;
	id: string;
	titleKey: string;
	renderContent: any;
	buttonLabelKey: string;
	buttonAriaLabelKey: string;
	executeAction: () => void;
	options?: TourStepOptions;
}
export interface CreateContentStepParams {
	htmlElementId: string;
	id: string;
	titleKey: string;
	contentKey: string;
	options?: TourStepOptions;
}
export interface CreateRenderStepParams {
	htmlElementId: string;
	id: string;
	titleKey: string;
	renderContent: any;
	options: TourStepOptions;
}

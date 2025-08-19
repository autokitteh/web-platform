import { ReactNode } from "react";

export interface FrameProps {
	children: ReactNode;
	className?: string;
	divId?: string;
}

export interface SplitFrameProps {
	children: ReactNode;
	rightFrameClass?: string;
}

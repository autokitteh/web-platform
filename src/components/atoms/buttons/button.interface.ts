import { MouseEventHandler } from "react";

export enum EButtonVariant {
	default = "default",
	transparent = "transparent",
	filled = "filled",
	outline = "outline",
}
export enum EButtonColor {
	black = "black",
	white = "white",
	gray = "gray",
}

type TButtonVariant = keyof typeof EButtonVariant;
type TButtonColor = keyof typeof EButtonColor;
type TButtonFontWeight = 500 | 600 | 700 | 800;

export interface IButton extends React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>, React.AriaAttributes {
	className: string;
	variant: TButtonVariant;
	color: TButtonColor;
	fontWeight: TButtonFontWeight;
	href: string;
	disabled: boolean;
	children: React.ReactNode;
	onClick: MouseEventHandler<HTMLButtonElement> | undefined;
}

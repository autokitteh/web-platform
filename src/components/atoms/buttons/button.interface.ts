import { MouseEventHandler } from "react";

export enum EButtonVariant {
	default = "default",
	transparent = "transparent",
	filled = "filled",
	outline = "outline",
	subtle = "subtle",
}
export enum EButtonColor {
	black = "black",
	white = "white",
	gray = "gray",
}

type TButtonVariant = keyof typeof EButtonVariant;
type TButtonColor = keyof typeof EButtonColor;

export interface IButton extends React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>, React.AriaAttributes {
	className: string;
	variant: TButtonVariant;
	color: TButtonColor;
	href: string;
	disabled: boolean;
	children: React.ReactNode;
	onClick: MouseEventHandler<HTMLButtonElement> | undefined;
	onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

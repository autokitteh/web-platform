import React, { MouseEventHandler } from "react";
import { TButtonVariant } from "@type/components";

export interface IButton extends React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>, React.AriaAttributes {
	className: string;
	variant: TButtonVariant;
	href: string;
	disabled: boolean;
	children: React.ReactNode;
	onClick: MouseEventHandler<HTMLButtonElement> | undefined;
	onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface IDropdownButton extends Partial<IButton> {
	contentMenu: React.ReactNode;
}

export interface IIconButton extends Partial<IButton> {
	children: React.ReactNode;
	variant?: Exclude<TButtonVariant, "trasparent">;
}

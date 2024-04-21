import React, { MouseEventHandler } from "react";
import { ButtonType, SortDirection } from "@type/components";

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>, React.AriaAttributes {
	className: string;
	ariaLabel: string;
	variant: ButtonType;
	href: string;
	disabled: boolean;
	children: React.ReactNode;
	type?: "button" | "submit" | "reset";
	form?: string;
	onClick: MouseEventHandler<HTMLButtonElement> | undefined;
	onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface DropdownButtonProps extends Partial<ButtonProps> {
	contentMenu: React.ReactNode;
}

export interface DropdownState {
	isOpen: boolean;
	style: React.CSSProperties;
}

export interface IconButtonProps extends Partial<ButtonProps> {
	children: React.ReactNode;
	variant?: ButtonType;
}

export interface SortButtonProps {
	className?: string;
	ariaLabel: string;
	isActive: boolean;
	sortDirection: SortDirection | undefined;
}

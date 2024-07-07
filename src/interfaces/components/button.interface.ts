import { ButtonType, SortDirection } from "@type/components";
import React, { KeyboardEventHandler, MouseEventHandler } from "react";

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>, React.AriaAttributes {
	className: string;
	ariaLabel: string;
	variant: ButtonType;
	href: string;
	disabled: boolean;
	children: React.ReactNode;
	type?: "button" | "submit" | "reset";
	form?: string;
	onClick: MouseEventHandler<HTMLButtonElement>;
	onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
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

export interface IconButtonProps extends React.AriaAttributes, React.DOMAttributes<HTMLDivElement> {
	className?: string;
	ariaLabel?: string;
	variant?: ButtonType;
	href?: string;
	disabled?: boolean;
	children: React.ReactNode;
	form?: string;
	title?: string;
	onClick?: MouseEventHandler<HTMLDivElement | HTMLButtonElement>;
	onKeyDown?: KeyboardEventHandler<HTMLDivElement | HTMLButtonElement>;
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>) => void;
}

export interface SortButtonProps {
	className?: string;
	ariaLabel: string;
	isActive: boolean;
	sortDirection: SortDirection | undefined;
}

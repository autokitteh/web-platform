import { ButtonType, SortDirection } from "@type/components";
import React, { KeyboardEventHandler, MouseEventHandler } from "react";

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>, React.AriaAttributes {
	ariaLabel: string;
	children: React.ReactNode;
	className: string;
	disabled: boolean;
	form?: string;
	href: string;
	onClick: MouseEventHandler<HTMLButtonElement>;
	onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
	onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	type?: "button" | "submit" | "reset";
	variant: ButtonType;
}

export interface DropdownButtonProps extends Partial<ButtonProps> {
	contentMenu: React.ReactNode;
}

export interface DropdownState {
	isOpen: boolean;
	style: React.CSSProperties;
}

export interface IconButtonProps extends React.AriaAttributes, React.DOMAttributes<HTMLDivElement> {
	ariaLabel?: string;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	form?: string;
	href?: string;
	onClick?: MouseEventHandler<HTMLDivElement | HTMLButtonElement>;
	onKeyDown?: KeyboardEventHandler<HTMLDivElement | HTMLButtonElement>;
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>) => void;
	title?: string;
	variant?: ButtonType;
}

export interface SortButtonProps {
	ariaLabel: string;
	className?: string;
	isActive: boolean;
	sortDirection: SortDirection | undefined;
}

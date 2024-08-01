import React, { KeyboardEventHandler, MouseEventHandler } from "react";

import { ColorSchemes } from "@src/types";
import { ButtonType, SortDirection } from "@type/components";

export interface ButtonProps extends React.HTMLAttributes<HTMLAnchorElement | HTMLButtonElement>, React.AriaAttributes {
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
	type?: "button" | "reset" | "submit";
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
	onClick?: MouseEventHandler<HTMLButtonElement | HTMLDivElement>;
	onKeyDown?: KeyboardEventHandler<HTMLButtonElement | HTMLDivElement>;
	onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>) => void;
	title?: string;
	variant?: ButtonType;
}

export interface SortButtonProps {
	ariaLabel: string;
	className?: string;
	isActive: boolean;
	variant?: ColorSchemes;
	sortDirection: SortDirection | undefined;
}

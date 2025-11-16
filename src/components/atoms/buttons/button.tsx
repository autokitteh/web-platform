import React, { forwardRef } from "react";

import { ButtonVariant } from "@enums/components";
import { ButtonProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Link } from "@components/atoms";

export const Button = forwardRef<HTMLButtonElement, Partial<ButtonProps>>(
	(
		{
			ariaLabel,
			children,
			className,
			valueText,
			disabled,
			form,
			href,
			id,
			onClick,
			onKeyPressed,
			style,
			onMouseEnter,
			onMouseLeave,
			tabIndex,
			title,
			variant,
			target,
			type = "button",
			["data-testid"]: dataTestId,
		},
		ref
	) => {
		const buttonClass = cn(
			"flex cursor-pointer items-center gap-2.5 rounded-3xl p-2 transition",
			"hover:text-current text-center text-gray-1100 duration-300 hover:bg-gray-1250",
			{
				"bg-black text-white": variant === ButtonVariant.filled,
				"bg-gray-1200 text-white hover:bg-gray-1050": variant === ButtonVariant.filledGray,
				"bg-transparent text-white hover:bg-gray-500": variant === ButtonVariant.light,
				"border border-gray-750 hover:bg-black hover:border-white": variant === ButtonVariant.outline,
				"text-white hover:bg-transparent hover:border-0": variant === ButtonVariant.flatText,
				"bg-transparent hover:bg-transparent p-0": variant === ButtonVariant.ghost,
			},
			{
				"pointer-events-none opacity-30": disabled,
			},
			className
		);
		const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
			if (event.key === "Enter" || event.key === " ") {
				onKeyPressed && onKeyPressed(event);
			}
		};

		const combinedAriaLabel = ariaLabel || title;

		return !href ? (
			<button
				aria-label={combinedAriaLabel}
				className={buttonClass}
				data-testid={dataTestId}
				disabled={disabled}
				form={form}
				id={id}
				onClick={onClick}
				onKeyDown={onKeyDown}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				ref={ref}
				style={style}
				tabIndex={tabIndex}
				title={title}
				type={type}
				value={valueText}
			>
				{children}
			</button>
		) : (
			<Link
				ariaLabel={combinedAriaLabel}
				className={buttonClass}
				disabled={disabled}
				id={id}
				target={target}
				title={title}
				to={href}
			>
				{children}
			</Link>
		);
	}
);

Button.displayName = "Button";

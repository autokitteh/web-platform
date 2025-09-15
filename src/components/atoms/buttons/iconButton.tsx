import React from "react";

import { ButtonVariant } from "@enums/components";
import { IconButtonProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Link } from "@components/atoms";

export const IconButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, IconButtonProps>(
	(
		{
			ariaLabel,
			children,
			className,
			disabled,
			href,
			onClick,
			onKeyDown,
			onMouseEnter,
			onMouseLeave,
			title,
			type = "button",
			variant,
			id,
		},
		ref
	) => {
		const iconButtonClass = cn(
			"flex shrink-0 items-center justify-center rounded-full p-2 outline-0 transition duration-300 hover:bg-gray-850",
			{
				"bg-black": variant === ButtonVariant.filled,
				"border border-gray-750 hover:border-transparent": variant === ButtonVariant.outline,
				"cursor-not-allowed opacity-40": disabled,
				"hover:border-gray-750": disabled && variant === ButtonVariant.outline,
				"hover:bg-transparen border hover:border-black/50": variant === ButtonVariant.flatText,
			},
			className
		);

		if (href) {
			return (
				<Link
					ariaLabel={ariaLabel}
					className={iconButtonClass}
					id={id}
					ref={ref as React.ForwardedRef<HTMLAnchorElement>}
					title={title}
					to={href}
				>
					{children}
				</Link>
			);
		}

		return (
			<button
				aria-label={ariaLabel}
				className={iconButtonClass}
				disabled={disabled}
				id={id}
				onClick={onClick}
				onKeyDown={onKeyDown}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				ref={ref as React.ForwardedRef<HTMLButtonElement>}
				tabIndex={0}
				title={title}
				type={type}
			>
				{children}
			</button>
		);
	}
);

IconButton.displayName = "IconButton";

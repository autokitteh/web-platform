import { KeyboardEvent, MouseEvent } from "react";

import { SessionStateType } from "@enums";
import { cn, getSessionStateColor } from "@utilities";

export interface SessionCountBadgeProps {
	count: number;
	sessionType: SessionStateType;
	title: string;
	onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
	variant?: "compact" | "default";
	className?: string;
}

export const SessionCountBadge = ({
	count,
	sessionType,
	title,
	onClick,
	variant = "default",
	className,
}: SessionCountBadgeProps) => {
	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if ((e.key === "Enter" || e.key === " ") && onClick) {
			onClick(e);
		}
	};

	const baseStyles =
		variant === "compact"
			? "inline-flex h-6 min-w-8 items-center justify-center rounded-full px-2 text-xs font-medium"
			: "max-w-12 truncate border-0 px-1 py-2 text-sm font-medium sm:max-w-12 2xl:max-w-16 3xl:max-w-24 inline-flex h-7 min-w-12 items-center justify-center rounded-3xl hover:bg-gray-1100";

	return (
		<div
			className={cn(baseStyles, getSessionStateColor(sessionType), className)}
			onClick={onClick}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
			title={title}
		>
			{count}
		</div>
	);
};

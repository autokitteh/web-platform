import React from "react";

import { cn } from "@utilities";

import { Button, IconSvg } from "@components/atoms";

import { PlusIcon, StartTemplateIcon, SessionsIcon, WebhookIcon } from "@assets/image/icons";

interface QuickActionItem {
	label: string;
	href: string;
	icon: React.FC<React.SVGProps<SVGSVGElement>>;
	variant?: "primary" | "secondary";
}

interface QuickActionsProps {
	className?: string;
}

const actions: QuickActionItem[] = [
	{ label: "New Project", href: "/", icon: PlusIcon, variant: "primary" },
	{ label: "Templates", href: "/templates-library", icon: StartTemplateIcon },
	{ label: "Sessions", href: "/events", icon: SessionsIcon },
	{ label: "Connections", href: "/connections", icon: WebhookIcon },
];

export const QuickActions = ({ className }: QuickActionsProps) => (
	<div className={cn("flex flex-wrap gap-3", className)}>
		{actions.map((action) => (
			<Button
				className={cn(
					"group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
					action.variant === "primary"
						? "bg-green-500 text-gray-1300 hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20"
						: "border border-gray-1050 bg-transparent text-white hover:border-gray-750 hover:bg-gray-1100"
				)}
				href={action.href}
				key={action.label}
			>
				<IconSvg
					className={cn(
						"size-4 transition-transform group-hover:scale-110",
						action.variant === "primary" ? "fill-gray-1300" : "fill-white"
					)}
					src={action.icon}
				/>
				{action.label}
			</Button>
		))}
	</div>
);

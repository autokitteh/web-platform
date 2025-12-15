import React from "react";

import { cn } from "@utilities";

type MetricVariant = "primary" | "success" | "warning" | "info";

interface HeroMetricCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	delta?: number;
	deltaLabel?: string;
	variant?: MetricVariant;
	icon?: React.ReactNode;
	isLoading?: boolean;
	className?: string;
}

const variantStyles: Record<MetricVariant, { accent: string; glow: string; gradient: string }> = {
	primary: {
		gradient: "from-gray-1200 via-gray-1200 to-gray-1100",
		accent: "text-white",
		glow: "rgba(255, 255, 255, 0.03)",
	},
	success: {
		gradient: "from-gray-1200 via-gray-1200 to-emerald-950/20",
		accent: "text-emerald-400",
		glow: "rgba(52, 211, 153, 0.05)",
	},
	warning: {
		gradient: "from-gray-1200 via-gray-1200 to-amber-950/20",
		accent: "text-amber-400",
		glow: "rgba(251, 191, 36, 0.05)",
	},
	info: {
		gradient: "from-gray-1200 via-gray-1200 to-blue-950/20",
		accent: "text-blue-400",
		glow: "rgba(96, 165, 250, 0.05)",
	},
};

const MetricSkeleton = () => (
	<div className="animate-pulse rounded-2xl bg-gray-1200 p-6">
		<div className="mb-3 h-4 w-24 rounded bg-gray-1050" />
		<div className="mb-2 h-10 w-20 rounded bg-gray-1050" />
		<div className="h-3 w-16 rounded bg-gray-1050" />
	</div>
);

export const HeroMetricCard = ({
	title,
	value,
	subtitle,
	delta,
	deltaLabel,
	variant = "primary",
	icon,
	isLoading = false,
	className,
}: HeroMetricCardProps) => {
	if (isLoading) {
		return <MetricSkeleton />;
	}

	const styles = variantStyles[variant];
	const hasDelta = delta !== undefined;
	const isPositiveDelta = hasDelta && delta > 0;
	const isNegativeDelta = hasDelta && delta < 0;

	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 transition-all duration-300 hover:scale-[1.02]",
				styles.gradient,
				className
			)}
			style={{
				boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 40px ${styles.glow}`,
			}}
		>
			<div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

			<div className="relative">
				<div className="mb-1 flex items-center justify-between">
					<span className="text-sm font-medium tracking-wide text-gray-400">{title}</span>
					{icon ? <span className={cn("text-lg", styles.accent)}>{icon}</span> : null}
				</div>

				<div className={cn("text-4xl font-bold tracking-tight", styles.accent)}>{value}</div>

				<div className="mt-2 flex items-center gap-2">
					{hasDelta ? (
						<span
							className={cn(
								"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
								isPositiveDelta && "bg-emerald-500/10 text-emerald-400",
								isNegativeDelta && "bg-red-500/10 text-red-400",
								!isPositiveDelta && !isNegativeDelta && "bg-gray-500/10 text-gray-400"
							)}
						>
							{isPositiveDelta ? "↑" : isNegativeDelta ? "↓" : "→"}
							{Math.abs(delta)}
							{deltaLabel}
						</span>
					) : null}
					{subtitle ? <span className="text-xs text-gray-500">{subtitle}</span> : null}
				</div>
			</div>
		</div>
	);
};

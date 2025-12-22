import { ActivityState } from "@constants/activities.constants";
import { twConfig } from "@utilities/getTailwindConfig.utils";

export type SessionStatus = (typeof ActivityState)[keyof typeof ActivityState];

export type TremorColor = "green" | "blue" | "red" | "yellow" | "gray" | "slate" | "emerald" | "cyan";

export const sessionStatusColors: Record<SessionStatus, TremorColor> = {
	[ActivityState.completed]: "green",
	[ActivityState.running]: "blue",
	[ActivityState.error]: "red",
	[ActivityState.stopped]: "yellow",
	[ActivityState.created]: "gray",
	[ActivityState.unspecified]: "slate",
} as const;

export const sessionStatusHex: Record<SessionStatus, string> = {
	[ActivityState.completed]: twConfig.theme.colors.green[500],
	[ActivityState.running]: twConfig.theme.colors.blue[500],
	[ActivityState.error]: twConfig.theme.colors.error.DEFAULT,
	[ActivityState.stopped]: twConfig.theme.colors.yellow[500],
	[ActivityState.created]: twConfig.theme.colors.gray[600],
	[ActivityState.unspecified]: twConfig.theme.colors.gray[600],
};

export const sessionStatusLabels: Record<SessionStatus, string> = {
	[ActivityState.completed]: "Completed",
	[ActivityState.running]: "Running",
	[ActivityState.error]: "Error",
	[ActivityState.stopped]: "Stopped",
	[ActivityState.created]: "Created",
	[ActivityState.unspecified]: "Unknown",
} as const;

export const sessionStatusTextClasses: Record<SessionStatus, string> = {
	[ActivityState.completed]: "text-green-800",
	[ActivityState.running]: "text-blue-500",
	[ActivityState.error]: "text-error",
	[ActivityState.stopped]: "text-yellow-500",
	[ActivityState.created]: "text-white",
	[ActivityState.unspecified]: "text-blue-500",
} as const;

export type TriggerType = "connection" | "cron" | "webhook" | "manual";

export const triggerTypeColors: Record<TriggerType, TremorColor> = {
	connection: "blue",
	cron: "yellow",
	webhook: "green",
	manual: "gray",
} as const;

export const triggerTypeLabels: Record<TriggerType, string> = {
	connection: "Connection",
	cron: "Scheduled",
	webhook: "Webhook",
	manual: "Manual",
} as const;

export type DashboardTimeRange = "24h" | "7d" | "30d" | "90d";

export const timeRangeOptions: Array<{ label: string; value: DashboardTimeRange }> = [
	{ label: "Last 24 hours", value: "24h" },
	{ label: "Last 7 days", value: "7d" },
	{ label: "Last 30 days", value: "30d" },
	{ label: "Last 90 days", value: "90d" },
] as const;

export const defaultTimeRange: DashboardTimeRange = "7d";

export const autoRefreshIntervalMs = 60000; // 1 minute

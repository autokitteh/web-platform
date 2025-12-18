import { ActivityState } from "@constants/activities.constants";

export type SessionStatus = (typeof ActivityState)[keyof typeof ActivityState];

export type TremorColor = "green" | "blue" | "red" | "amber" | "gray" | "slate" | "emerald" | "cyan";

export const sessionStatusColors: Record<SessionStatus, TremorColor> = {
	[ActivityState.completed]: "green",
	[ActivityState.running]: "blue",
	[ActivityState.error]: "red",
	[ActivityState.stopped]: "amber",
	[ActivityState.created]: "gray",
	[ActivityState.unspecified]: "slate",
} as const;

export const sessionStatusHex: Record<SessionStatus, string> = {
	[ActivityState.completed]: "#86D13F",
	[ActivityState.running]: "#3b82f6",
	[ActivityState.error]: "#FF6B61",
	[ActivityState.stopped]: "#f59e0b",
	[ActivityState.created]: "#bec3d1",
	[ActivityState.unspecified]: "#bec3d1",
} as const;

export const sessionStatusLabels: Record<SessionStatus, string> = {
	[ActivityState.completed]: "Completed",
	[ActivityState.running]: "Running",
	[ActivityState.error]: "Error",
	[ActivityState.stopped]: "Stopped",
	[ActivityState.created]: "Created",
	[ActivityState.unspecified]: "Unknown",
} as const;

export type TriggerType = "connection" | "cron" | "webhook" | "manual";

export const triggerTypeColors: Record<TriggerType, TremorColor> = {
	connection: "blue",
	cron: "amber",
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

export const autoRefreshIntervalMs = 30000;

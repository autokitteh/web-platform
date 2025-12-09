import { ReactNode } from "react";

import { DashboardTimeRange, SessionStatus, TremorColor, TriggerType } from "@constants";

export interface StatCardProps {
	title: string;
	value: string | number;
	delta?: number;
	deltaLabel?: string;
	trendDirection?: "up" | "down" | "neutral";
	isLoading?: boolean;
	onClick?: () => void;
	className?: string;
	icon?: ReactNode;
}

export interface SessionStatusBadgeProps {
	status: SessionStatus;
	label?: string;
	showDot?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
}

export interface MetricLabelProps {
	label: string;
	value: string | number;
	valueColor?: TremorColor;
	className?: string;
}

export interface ChartContainerProps {
	title: string;
	subtitle?: string;
	children: ReactNode;
	isLoading?: boolean;
	error?: string;
	onRetry?: () => void;
	controls?: ReactNode;
	className?: string;
}

export interface MetricGroupProps {
	children: ReactNode;
	columns?: 2 | 3 | 4;
	className?: string;
}

export interface EmptyStateProps {
	title: string;
	description?: string;
	icon?: ReactNode;
	action?: ReactNode;
	className?: string;
}

export interface ErrorStateProps {
	title?: string;
	message: string;
	onRetry?: () => void;
	className?: string;
}

export interface TimeRangeSelectorProps {
	value: DashboardTimeRange;
	onChange: (value: DashboardTimeRange) => void;
	className?: string;
}

export interface SessionStatusData {
	status: SessionStatus;
	count: number;
}

export interface SessionsOverTimeData {
	date: string;
	completed: number;
	error: number;
	running: number;
	stopped: number;
}

export interface EventsByTriggerData {
	triggerType: TriggerType;
	count: number;
}

export interface IntegrationUsageData {
	integration: string;
	connectionCount: number;
}

export interface RecentSessionData {
	projectName: string;
	projectId: string;
	sessionId: string;
	status: SessionStatus;
	durationMs: number;
	lastActivityTime: string;
}

export interface DashboardSummary {
	totalProjects: number;
	totalProjectsChange?: number;
	activeSessions: number;
	activeSessionsChange?: number;
	successRate: number;
	successRateChange?: number;
	eventsProcessed: number;
	eventsProcessedChange?: number;
}

export interface DashboardLayoutProps {
	children: ReactNode;
	header?: ReactNode;
	className?: string;
}

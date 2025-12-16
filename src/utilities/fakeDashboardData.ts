import { DashboardTimeRange, SessionStatus, TriggerType } from "@constants";
import { ActivityState } from "@constants/activities.constants";

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
	percentage: number;
}

export interface IntegrationUsageData {
	integration: string;
	connectionCount: number;
	eventsTriggered: number;
}

export interface RecentSessionData {
	projectName: string;
	projectId: string;
	sessionId: string;
	status: SessionStatus;
	durationMs: number;
	lastActivityTime: string;
}

export interface ErrorSessionData {
	projectName: string;
	projectId: string;
	sessionId: string;
	entrypoint: string;
	eventType: TriggerType;
	durationMs: number;
	timestamp: string;
	trendData: number[];
}

export interface EventVolumeData {
	date: string;
	total: number;
	connection?: number;
	webhook?: number;
	cron?: number;
	manual?: number;
}

export interface DashboardSummaryData {
	totalProjects: number;
	totalProjectsChange: number;
	activeSessions: number;
	activeSessionsChange: number;
	successRate: number;
	successRateChange: number;
	eventsProcessed: number;
	eventsProcessedChange: number;
}

const generateDateRange = (timeRange: DashboardTimeRange): string[] => {
	const dates: string[] = [];
	const now = new Date();
	let days = 7;

	switch (timeRange) {
		case "24h":
			days = 1;
			break;
		case "7d":
			days = 7;
			break;
		case "30d":
			days = 30;
			break;
		case "90d":
			days = 90;
			break;
	}

	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(now);
		date.setDate(date.getDate() - i);
		if (timeRange === "24h") {
			dates.push(date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
		} else {
			dates.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
		}
	}

	return dates;
};

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateSessionStatusData = (): SessionStatusData[] => [
	{ status: ActivityState.completed, count: randomInt(150, 250) },
	{ status: ActivityState.running, count: randomInt(10, 30) },
	{ status: ActivityState.error, count: randomInt(15, 45) },
	{ status: ActivityState.stopped, count: randomInt(5, 20) },
	{ status: ActivityState.created, count: randomInt(2, 10) },
];

export const generateSessionsOverTimeData = (): SessionsOverTimeData[] => {
	const dates = generateDateRange("7d");

	return dates.map((date) => ({
		date,
		completed: randomInt(20, 80),
		error: randomInt(2, 15),
		running: randomInt(5, 20),
		stopped: randomInt(1, 8),
	}));
};

export const generateEventsByTriggerData = (): EventsByTriggerData[] => {
	const connectionCount = randomInt(400, 600);
	const webhookCount = randomInt(250, 400);
	const cronCount = randomInt(100, 200);
	const manualCount = randomInt(30, 80);
	const total = connectionCount + webhookCount + cronCount + manualCount;

	return [
		{
			triggerType: "connection",
			count: connectionCount,
			percentage: Math.round((connectionCount / total) * 100),
		},
		{
			triggerType: "webhook",
			count: webhookCount,
			percentage: Math.round((webhookCount / total) * 100),
		},
		{
			triggerType: "cron",
			count: cronCount,
			percentage: Math.round((cronCount / total) * 100),
		},
		{
			triggerType: "manual",
			count: manualCount,
			percentage: Math.round((manualCount / total) * 100),
		},
	];
};

export const generateIntegrationUsageData = (): IntegrationUsageData[] => [
	{ integration: "GitHub", connectionCount: randomInt(8, 15), eventsTriggered: randomInt(200, 400) },
	{ integration: "Slack", connectionCount: randomInt(5, 12), eventsTriggered: randomInt(150, 300) },
	{ integration: "Jira", connectionCount: randomInt(3, 8), eventsTriggered: randomInt(80, 150) },
	{ integration: "Discord", connectionCount: randomInt(2, 6), eventsTriggered: randomInt(50, 120) },
	{ integration: "Google Sheets", connectionCount: randomInt(2, 5), eventsTriggered: randomInt(30, 80) },
	{ integration: "AWS", connectionCount: randomInt(1, 4), eventsTriggered: randomInt(20, 60) },
];

const projectNames = [
	"GitOps Workflow",
	"Slack Notifications",
	"Issue Tracker",
	"CI/CD Pipeline",
	"Data Sync",
	"Alert Manager",
	"Deployment Bot",
	"PR Reviewer",
];

const generateSessionId = (): string => `ses_${Math.random().toString(36).substring(2, 10)}`;

const generateProjectId = (): string => `prj_${Math.random().toString(36).substring(2, 10)}`;

const getRandomStatus = (): SessionStatus => {
	const statuses: SessionStatus[] = [
		ActivityState.completed,
		ActivityState.completed,
		ActivityState.completed,
		ActivityState.running,
		ActivityState.error,
		ActivityState.stopped,
	];

	return statuses[randomInt(0, statuses.length - 1)];
};

const getRelativeTime = (minutesAgo: number): string => {
	if (minutesAgo < 1) return "just now";
	if (minutesAgo < 60) return `${minutesAgo} min ago`;
	const hours = Math.floor(minutesAgo / 60);
	if (hours < 24) return `${hours}h ago`;

	return `${Math.floor(hours / 24)}d ago`;
};

export const generateRecentSessionsData = (): RecentSessionData[] =>
	Array.from({ length: 10 }, () => ({
		projectName: projectNames[randomInt(0, projectNames.length - 1)],
		projectId: generateProjectId(),
		sessionId: generateSessionId(),
		status: getRandomStatus(),
		durationMs: randomInt(5000, 300000),
		lastActivityTime: getRelativeTime(randomInt(0, 120)),
	})).sort((a, b) => {
		const aMin = parseInt(a.lastActivityTime) || 0;
		const bMin = parseInt(b.lastActivityTime) || 0;

		return aMin - bMin;
	});

export const generateDashboardSummary = (): DashboardSummaryData => {
	const totalSessions = randomInt(200, 350);
	const completedSessions = randomInt(150, 280);
	const successRate = Math.round((completedSessions / totalSessions) * 100 * 10) / 10;

	return {
		totalProjects: randomInt(8, 18),
		totalProjectsChange: randomInt(-2, 5),
		activeSessions: randomInt(12, 35),
		activeSessionsChange: randomInt(-15, 25),
		successRate,
		successRateChange: randomInt(-5, 8),
		eventsProcessed: randomInt(1200, 2500),
		eventsProcessedChange: randomInt(-200, 400),
	};
};

export const formatDuration = (ms: number): string => {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	if (minutes === 0) return `${seconds}s`;

	return `${minutes}m ${remainingSeconds}s`;
};

export const formatNumber = (num: number): string => {
	if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
	if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;

	return num.toString();
};

const entrypoints = [
	"on_github_push",
	"on_slack_message",
	"on_jira_issue_created",
	"on_schedule",
	"on_webhook",
	"on_discord_message",
	"on_aws_event",
	"on_http_request",
];

const triggerTypes: TriggerType[] = ["connection", "webhook", "cron", "manual"];

const getRandomTriggerType = (): TriggerType => triggerTypes[randomInt(0, triggerTypes.length - 1)];

const generateTrendData = (): number[] => Array.from({ length: 7 }, () => randomInt(0, 10));

export const generateErrorSessionsData = (): ErrorSessionData[] =>
	Array.from({ length: 8 }, () => ({
		projectName: projectNames[randomInt(0, projectNames.length - 1)],
		projectId: generateProjectId(),
		sessionId: generateSessionId(),
		entrypoint: entrypoints[randomInt(0, entrypoints.length - 1)],
		eventType: getRandomTriggerType(),
		durationMs: randomInt(1000, 60000),
		timestamp: getRelativeTime(randomInt(0, 180)),
		trendData: generateTrendData(),
	})).sort((a, b) => {
		const aMin = parseInt(a.timestamp) || 0;
		const bMin = parseInt(b.timestamp) || 0;

		return aMin - bMin;
	});

export const generateEventVolumeData = (): EventVolumeData[] => {
	const dates = generateDateRange("7d");

	return dates.map((date) => {
		const connection = randomInt(80, 150);
		const webhook = randomInt(50, 100);
		const cron = randomInt(20, 50);
		const manual = randomInt(5, 20);

		return {
			date,
			total: connection + webhook + cron + manual,
			connection,
			webhook,
			cron,
			manual,
		};
	});
};

export interface DeploymentStatsData {
	deploymentId: string;
	projectName: string;
	projectId: string;
	totalSessions: number;
	completedSessions: number;
	runningSessions: number;
	errorSessions: number;
	stoppedSessions: number;
	createdAt: string;
	lastActivity: string;
}

export interface TotalCountersData {
	totalProjects: number;
	activeProjects: number;
	totalDeployments: number;
	activeDeployments: number;
	sessionsByStatus: {
		completed: number;
		created: number;
		error: number;
		running: number;
		stopped: number;
	};
}

export const generateDeploymentStatsData = (): DeploymentStatsData[] =>
	Array.from({ length: randomInt(4, 8) }, () => {
		const completed = randomInt(20, 100);
		const running = randomInt(0, 15);
		const error = randomInt(0, 20);
		const stopped = randomInt(0, 10);

		return {
			deploymentId: `dep_${Math.random().toString(36).substring(2, 10)}`,
			projectName: projectNames[randomInt(0, projectNames.length - 1)],
			projectId: generateProjectId(),
			totalSessions: completed + running + error + stopped,
			completedSessions: completed,
			runningSessions: running,
			errorSessions: error,
			stoppedSessions: stopped,
			createdAt: getRelativeTime(randomInt(60, 10080)),
			lastActivity: getRelativeTime(randomInt(0, 60)),
		};
	});

export const generateTotalCountersData = (): TotalCountersData => {
	const totalProjects = randomInt(12, 25);
	const activeProjects = randomInt(Math.floor(totalProjects * 0.5), totalProjects);
	const totalDeployments = randomInt(20, 50);
	const activeDeployments = randomInt(Math.floor(totalDeployments * 0.6), totalDeployments);

	return {
		totalProjects,
		activeProjects,
		totalDeployments,
		activeDeployments,
		sessionsByStatus: {
			completed: randomInt(500, 1500),
			running: randomInt(10, 50),
			error: randomInt(30, 150),
			stopped: randomInt(20, 80),
			created: randomInt(5, 25),
		},
	};
};

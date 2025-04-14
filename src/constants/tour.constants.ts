import { Placement } from "@floating-ui/react";
import i18n, { t } from "i18next";

import { TourId } from "@enums";
import { TourPopoverProps } from "@src/interfaces/components";
import { Tour } from "@src/interfaces/store";
import { verifyTourStepIdsUniqueness } from "@src/utilities";

import { renderCodeSettingsStep, renderManualRunStep } from "@components/organisms/tour/custom-tours-steps";

export const commonTourSteps = {
	connections: "connections",
	deploy: "deploy",
	manualRun: "manual_run",
	sessionsRefresh: "refresh_sessions",
	oauth: "oauth",
	oauthWait: "oauth_wait",
	sessionsTopNav: "sessions_top_nav",
	sessionsFinish: "sessions_finish",
} as const;

const prefixStepIds = <T extends Record<string, string>>(tourType: string, steps: T): Record<keyof T, string> => {
	const result: Record<string, string> = {};
	Object.entries(steps).forEach(([key, value]) => {
		result[key] = `${tourType}_${value}`;
	});
	return result as Record<keyof T, string>;
};

export const tourSteps = {
	quickstart: {
		...prefixStepIds("quickstart", commonTourSteps),
		projectCode: "quickstart_project_code",
		deployButton: "quickstart_deploy_button",
		manualRunButton: "quickstart_manual_run_button",
	},
	sendEmail: {
		...prefixStepIds("send_email", commonTourSteps),
		projectConnectionsTab: "send_email_project_connections_tab",
		editConnection: "send_email_edit_gmail_connection",
		googleOAuth: "send_email_google_oauth",
		deployButton: "send_email_deploy_button",
		manualRunButton: "send_email_manual_run_button",
	},
	sendSlack: {
		...prefixStepIds("send_slack", commonTourSteps),
		projectConnectionsTab: "send_slack_project_connections_tab",
		editConnection: "send_slack_edit_slack_connection",
		slackOAuth: "send_slack_slack_oauth",
		deployButton: "send_slack_deploy_button",
		manualRunButton: "send_slack_manual_run_button",
	},
} as const;

export let tours: Record<string, Tour> = {};

i18n.on("initialized", () => {
	tours = {
		[TourId.quickstart]: {
			id: TourId.quickstart,
			assetDirectory: "quickstart",
			defaultFile: "program.py",
			name: t("quickstart.name", { ns: "tour" }),
			description: t("quickstart.description", { ns: "tour" }),
			entrypointFunction: "on_manual_run",
			entrypointFile: "program.py",
			steps: [
				{
					htmlElementId: "tourProjectCode",
					id: tourSteps.quickstart.projectCode,
					title: "tourProjectCode",
					renderContent: renderCodeSettingsStep,
					placement: "bottom",
					highlight: false,
					displayNext: true,
					pathPatterns: [/^\/projects\/[^/]+\/code$/],
				},
				{
					htmlElementId: "tourDeployButton",
					id: tourSteps.quickstart.deployButton,
					title: t("quickstart.steps.deployButton.title", { ns: "tour" }),
					content: t("quickstart.steps.deployButton.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+$/,
						/^\/projects\/[^/]+\/code$/,
						/^\/projects\/[^/]+\/connections$/,
						/^\/projects\/[^/]+\/triggers$/,
						/^\/projects\/[^/]+\/variables$/,
					],
				},
				{
					htmlElementId: "tourManualRunButton",
					id: tourSteps.quickstart.manualRunButton,
					title: "tourManualRunButton",
					renderContent: renderManualRunStep,
					placement: "bottom",
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+$/,
						/^\/projects\/[^/]+\/code$/,
						/^\/projects\/[^/]+\/connections$/,
						/^\/projects\/[^/]+\/triggers$/,
						/^\/projects\/[^/]+\/variables$/,
					],
				},
				{
					htmlElementId: "tourSessionsTopNav",
					id: tourSteps.quickstart.sessionsTopNav,
					title: t("quickstart.steps.sessionsTopNav.title", { ns: "tour" }),
					content: t("quickstart.steps.sessionsTopNav.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+$/,
						/^\/projects\/[^/]+\/code$/,
						/^\/projects\/[^/]+\/connections$/,
						/^\/projects\/[^/]+\/triggers$/,
						/^\/projects\/[^/]+\/variables$/,
						/^\/projects\/[^/]+\/sessions$/,
						/^\/projects\/[^/]+\/sessions\/[^/]+$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions\/[^/]+$/,
					],
				},
				{
					htmlElementId: "tourSessionsRefresh",
					id: tourSteps.quickstart.sessionsRefresh,
					title: t("quickstart.steps.sessionsRefresh.title", { ns: "tour" }),
					content: t("quickstart.steps.sessionsRefresh.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+\/sessions$/,
						/^\/projects\/[^/]+\/sessions\/[^/]+$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions\/[^/]+$/,
					],
				},
			],
		},
		[TourId.sendEmail]: {
			id: TourId.sendEmail,
			description: t("sendEmail.description", { ns: "tour" }),
			assetDirectory: "send_email",
			defaultFile: "program.py",
			name: t("sendEmail.name", { ns: "tour" }),
			entrypointFunction: "on_manual_run",
			entrypointFile: "program.py",
			steps: [
				{
					htmlElementId: "tourProjectConnectionsTab",
					id: tourSteps.sendEmail.connections,
					title: t("sendEmail.steps.connections.title", { ns: "tour" }),
					content: t("sendEmail.steps.connections.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [/^\/projects\/[^/]+$/, /^\/projects\/[^/]+\/code$/],
				},
				{
					htmlElementId: "tourEditgmail_connConnection",
					id: tourSteps.sendEmail.editConnection,
					title: t("sendEmail.steps.editConnection.title", { ns: "tour" }),
					content: t("sendEmail.steps.editConnection.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [/^\/projects\/[^/]+\/connections$/],
				},
				{
					htmlElementId: "tourGoogleOAuth",
					title: t("sendEmail.steps.startOauth.title", { ns: "tour" }),
					content: t("sendEmail.steps.startOauth.content", { ns: "tour" }),
					id: tourSteps.sendEmail.googleOAuth,
					placement: "bottom",
					highlight: true,
					pathPatterns: [/^\/projects\/[^/]+\/connections$/, /^\/projects\/[^/]+\/connections\/[^/]+\/edit$/],
				},
				{
					htmlElementId: "tourOAuthWait",
					title: t("sendEmail.steps.waitOauth.title", { ns: "tour" }),
					content: t("sendEmail.steps.waitOauth.content", { ns: "tour" }),
					placement: "bottom",
					id: tourSteps.sendEmail.oauthWait,
					hideBack: true,
					highlight: false,
					pathPatterns: [/^\/projects\/[^/]+\/connections$/, /^\/projects\/[^/]+\/connections\/[^/]+\/edit$/],
				},
				{
					htmlElementId: "tourDeployButton",
					title: t("sendEmail.steps.deployButton.title", { ns: "tour" }),
					content: t("sendEmail.steps.deployButton.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					id: tourSteps.sendEmail.deployButton,
					pathPatterns: [
						/^\/projects\/[^/]+$/,
						/^\/projects\/[^/]+\/code$/,
						/^\/projects\/[^/]+\/connections$/,
						/^\/projects\/[^/]+\/triggers$/,
						/^\/projects\/[^/]+\/variables$/,
					],
				},
				{
					htmlElementId: "tourManualRunButton",
					title: "tourManualRunButton",
					renderContent: renderManualRunStep,
					placement: "bottom",
					id: tourSteps.sendEmail.manualRunButton,
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+$/,
						/^\/projects\/[^/]+\/code$/,
						/^\/projects\/[^/]+\/connections$/,
						/^\/projects\/[^/]+\/triggers$/,
						/^\/projects\/[^/]+\/variables$/,
					],
				},
				{
					htmlElementId: "tourSessionsTopNav",
					title: t("sendEmail.steps.sessionsTopNav.title", { ns: "tour" }),
					content: t("sendEmail.steps.sessionsTopNav.content", { ns: "tour" }),
					placement: "bottom",
					id: tourSteps.sendEmail.sessionsTopNav,
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+$/,
						/^\/projects\/[^/]+\/code$/,
						/^\/projects\/[^/]+\/connections$/,
						/^\/projects\/[^/]+\/triggers$/,
						/^\/projects\/[^/]+\/variables$/,
						/^\/projects\/[^/]+\/sessions$/,
						/^\/projects\/[^/]+\/sessions\/[^/]+$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions\/[^/]+$/,
					],
				},
				{
					htmlElementId: "tourSessionsRefresh",
					title: t("sendEmail.steps.sessionsRefresh.title", { ns: "tour" }),
					content: t("sendEmail.steps.sessionsRefresh.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					id: tourSteps.sendEmail.sessionsRefresh,
					pathPatterns: [
						/^\/projects\/[^/]+\/sessions$/,
						/^\/projects\/[^/]+\/sessions\/[^/]+$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions\/[^/]+$/,
					],
				},
				{
					htmlElementId: "tourSessionsRefresh",
					title: t("sendEmail.steps.sessionsFinish.title", { ns: "tour" }),
					content: t("sendEmail.steps.sessionsFinish.content", { ns: "tour" }),
					placement: "bottom",
					id: tourSteps.sendEmail.sessionsFinish,
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+\/sessions$/,
						/^\/projects\/[^/]+\/sessions\/[^/]+$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions\/[^/]+$/,
					],
				},
			],
		},
		[TourId.sendSlack]: {
			id: TourId.sendSlack,
			description: t("sendSlack.description", { ns: "tour" }),
			assetDirectory: "send_slack",
			defaultFile: "program.py",
			name: t("sendSlack.name", { ns: "tour" }),
			entrypointFunction: "on_manual_run",
			entrypointFile: "program.py",
			steps: [
				{
					htmlElementId: "tourProjectConnectionsTab",
					id: tourSteps.sendSlack.connections,
					title: t("sendEmail.steps.connections.title", { ns: "tour" }),
					content: t("sendEmail.steps.connections.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [/^\/projects\/[^/]+$/, /^\/projects\/[^/]+\/code$/],
				},
				{
					htmlElementId: "tourEditslack_connConnection",
					id: tourSteps.sendSlack.editConnection,
					title: t("sendEmail.steps.editConnection.content", { ns: "tour" }),
					content: t("sendEmail.steps.editConnection.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [/^\/projects\/[^/]+\/connections$/],
				},
				{
					htmlElementId: "tourSlackOAuth",
					id: tourSteps.sendSlack.slackOAuth,
					title: t("sendSlack.steps.startOauth.content", { ns: "tour" }),
					content: t("sendSlack.steps.startOauth.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [/^\/projects\/[^/]+\/connections$/, /^\/projects\/[^/]+\/connections\/[^/]+\/edit$/],
				},
				{
					htmlElementId: "tourOAuthWait",
					id: tourSteps.sendSlack.oauthWait,
					title: t("sendSlack.steps.waitOauth.content", { ns: "tour" }),
					content: t("sendSlack.steps.waitOauth.content", { ns: "tour" }),
					placement: "bottom",
					hideBack: true,
					highlight: false,
					pathPatterns: [/^\/projects\/[^/]+\/connections$/, /^\/projects\/[^/]+\/connections\/[^/]+\/edit$/],
				},
				{
					htmlElementId: "tourDeployButton",
					id: tourSteps.sendSlack.deployButton,
					title: t("sendSlack.steps.deployButton.title", { ns: "tour" }),
					content: t("sendSlack.steps.deployButton.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+$/,
						/^\/projects\/[^/]+\/code$/,
						/^\/projects\/[^/]+\/connections$/,
						/^\/projects\/[^/]+\/triggers$/,
						/^\/projects\/[^/]+\/variables$/,
					],
				},
				{
					htmlElementId: "tourManualRunButton",
					id: tourSteps.sendSlack.manualRunButton,
					title: "tourManualRunButton",
					renderContent: renderManualRunStep,
					placement: "bottom",
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+$/,
						/^\/projects\/[^/]+\/code$/,
						/^\/projects\/[^/]+\/connections$/,
						/^\/projects\/[^/]+\/triggers$/,
						/^\/projects\/[^/]+\/variables$/,
					],
				},
				{
					htmlElementId: "tourSessionsTopNav",
					id: tourSteps.sendSlack.sessionsTopNav,
					title: t("sendSlack.steps.sessionsTopNav.title", { ns: "tour" }),
					content: t("sendSlack.steps.sessionsTopNav.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+$/,
						/^\/projects\/[^/]+\/code$/,
						/^\/projects\/[^/]+\/connections$/,
						/^\/projects\/[^/]+\/triggers$/,
						/^\/projects\/[^/]+\/variables$/,
						/^\/projects\/[^/]+\/sessions$/,
						/^\/projects\/[^/]+\/sessions\/[^/]+$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions\/[^/]+$/,
					],
				},
				{
					htmlElementId: "tourSessionsRefresh",
					id: tourSteps.sendSlack.sessionsRefresh,
					title: t("sendSlack.steps.sessionsRefresh.title", { ns: "tour" }),
					content: t("sendSlack.steps.sessionsRefresh.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+\/sessions$/,
						/^\/projects\/[^/]+\/sessions\/[^/]+$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions\/[^/]+$/,
					],
				},
				{
					htmlElementId: "tourSessionsRefresh",
					id: tourSteps.sendSlack.sessionsFinish,
					title: t("sendSlack.steps.sessionsFinish.title", { ns: "tour" }),
					content: t("sendSlack.steps.sessionsFinish.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+\/sessions$/,
						/^\/projects\/[^/]+\/sessions\/[^/]+$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions\/[^/]+$/,
					],
				},
			],
		},
	};

	verifyTourStepIdsUniqueness();
});

export const emptyTourStep: TourPopoverProps = {
	htmlElementId: "",
	title: "",
	content: "",
	customComponent: undefined,
	placement: "bottom" as Placement,
	hideBack: false,
	displayNext: false,
	onPrev: () => {},
	onSkip: () => {},
	onNext: () => {},
	isFirstStep: false,
	isLastStep: false,
	visible: false,
};

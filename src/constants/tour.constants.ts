import { Placement } from "@floating-ui/react";
import i18n, { t } from "i18next";

import {
	projectExplorerConnectionsSectionPathPattern,
	projectExplorerPathPattern,
	projectExplorerSettingsPathPattern,
	projectSessionsPathPatterns,
} from "./pathPatterns.constants";
import { TourId } from "@enums";
import { TourPopoverProps } from "@src/interfaces/components";
import { Tour } from "@src/interfaces/store";
import { useTourStore } from "@src/store";
import { verifyTourStepIdsUniqueness } from "@src/utilities";

import { renderCodeSettingsStep, renderManualRunStep } from "@components/organisms/tour/custom-tours-steps";
import { renderOauthWaitStep } from "@components/organisms/tour/custom-tours-steps/factories";

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
		projectConfig: "send_email_project_config",
		projectConnections: "send_email_project_connections_tab",
		editConnection: "send_email_edit_gmail_connection",
		googleOAuth: "send_email_google_oauth",
		deployButton: "send_email_deploy_button",
		manualRunButton: "send_email_manual_run_button",
	},
	sendSlack: {
		...prefixStepIds("send_slack", commonTourSteps),
		projectConfig: "send_slack_project_config",
		projectConnections: "send_slack_project_connections_tab",
		editConnection: "send_slack_edit_slack_connection",
		slackOAuth: "send_slack_slack_oauth",
		deployButton: "send_slack_deploy_button",
		manualRunButton: "send_slack_manual_run_button",
	},
} as const;

export let tours: Record<string, Tour> = {};

export const tourStepsHTMLIds = {
	projectConfig: "tourProjectConfig",
	projectCode: "tourProjectCode",
	deployButton: "tourDeployButton",
	manualRunButton: "tourManualRunButton",
	sessionsTopNav: "tourSessionsTopNav",
	sessionsRefresh: "tourSessionsRefresh",
	projectConnections: "tourProjectConnections",
	projectTriggers: "tourProjectTriggers",
	projectVariables: "tourProjectVariables",
	editGmailConnection: "tourEditgmail_connConnection_gmailIntegration",
	googleOAuth: "tourGoogleOAuth",
	oauthWait: "tourOAuthWait",
	editSlackConnection: "tourEditslack_connConnection_slackIntegration",
	slackOAuth: "tourSlackOAuth",
};

const initializeTours = () => {
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
					htmlElementId: tourStepsHTMLIds.projectCode,
					id: tourSteps.quickstart.projectCode,
					title: t("quickstart.steps.projectCode.title", { ns: "tour" }),
					renderContent: renderCodeSettingsStep,
					placement: "bottom",
					highlight: false,
					pathPatterns: [projectExplorerPathPattern],
					actionButton: {
						execute: () => {
							const { nextStep } = useTourStore.getState();
							nextStep(window.location.pathname);
						},
						label: t("quickstart.steps.projectCode.buttonLabel", { ns: "tour" }),
						ariaLabel: t("quickstart.steps.projectCode.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.deployButton,
					id: tourSteps.quickstart.deployButton,
					title: t("quickstart.steps.deployButton.title", { ns: "tour" }),
					content: t("quickstart.steps.deployButton.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [projectExplorerPathPattern],
					actionButton: {
						execute: () => document.getElementById(tourStepsHTMLIds.deployButton)?.click(),
						label: t("quickstart.steps.deployButton.buttonLabel", { ns: "tour" }),
						ariaLabel: t("quickstart.steps.deployButton.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.manualRunButton,
					id: tourSteps.quickstart.manualRunButton,
					title: t("quickstart.steps.manualRunButton.title", { ns: "tour" }),
					renderContent: renderManualRunStep,
					placement: "bottom",
					highlight: true,
					pathPatterns: [projectExplorerPathPattern],
					actionButton: {
						execute: () => document.getElementById(tourStepsHTMLIds.manualRunButton)?.click(),
						label: t("quickstart.steps.manualRunButton.buttonLabel", { ns: "tour" }),
						ariaLabel: t("quickstart.steps.manualRunButton.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.sessionsTopNav,
					id: tourSteps.quickstart.sessionsTopNav,
					title: t("quickstart.steps.sessionsTopNav.title", { ns: "tour" }),
					content: t("quickstart.steps.sessionsTopNav.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [projectExplorerPathPattern],
					actionButton: {
						execute: () => document.getElementById(tourStepsHTMLIds.sessionsTopNav)?.click(),
						label: t("quickstart.steps.sessionsTopNav.buttonLabel", { ns: "tour" }),
						ariaLabel: t("quickstart.steps.sessionsTopNav.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.sessionsRefresh,
					id: tourSteps.quickstart.sessionsRefresh,
					title: t("quickstart.steps.sessionsRefresh.title", { ns: "tour" }),
					content: t("quickstart.steps.sessionsRefresh.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [
						/^\/projects\/[^/]+\/sessions\/[^/]+$/,
						/^\/projects\/[^/]+\/deployments\/[^/]+\/sessions\/[^/]+$/,
					],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.sessionsRefresh)?.click();
						},
						label: t("quickstart.steps.sessionsRefresh.buttonLabel", { ns: "tour" }),
						ariaLabel: t("quickstart.steps.sessionsRefresh.buttonAriaLabel", { ns: "tour" }),
					},
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
					htmlElementId: tourStepsHTMLIds.projectConfig,
					id: tourSteps.sendEmail.projectConfig,
					title: t("sendEmail.steps.projectConfig.title", { ns: "tour" }),
					content: t("sendEmail.steps.projectConfig.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [projectExplorerPathPattern],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.projectConfig)?.click();
						},
						label: t("sendEmail.steps.projectConfig.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendEmail.steps.projectConfig.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.editGmailConnection,
					id: tourSteps.sendEmail.editConnection,
					title: t("sendEmail.steps.editConnection.title", { ns: "tour" }),
					content: t("sendEmail.steps.editConnection.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [projectExplorerSettingsPathPattern],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.editGmailConnection)?.click();
						},
						label: t("sendEmail.steps.editConnection.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendEmail.steps.editConnection.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.googleOAuth,
					title: t("sendEmail.steps.startOauth.title", { ns: "tour" }),
					content: t("sendEmail.steps.startOauth.content", { ns: "tour" }),
					id: tourSteps.sendEmail.googleOAuth,
					placement: "bottom",
					highlight: true,
					pathPatterns: [projectExplorerConnectionsSectionPathPattern],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.googleOAuth)?.click();
						},
						label: t("sendEmail.steps.startOauth.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendEmail.steps.startOauth.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.oauthWait,
					title: t("sendEmail.steps.waitOauth.title", { ns: "tour" }),
					renderContent: renderOauthWaitStep,
					placement: "bottom",
					id: tourSteps.sendEmail.oauthWait,
					overlayAboveDrawer: true,
					hideBack: true,
					highlight: false,
					pathPatterns: [projectExplorerSettingsPathPattern],
				},
				{
					htmlElementId: tourStepsHTMLIds.deployButton,
					title: t("sendEmail.steps.deployButton.title", { ns: "tour" }),
					content: t("sendEmail.steps.deployButton.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					id: tourSteps.sendEmail.deployButton,
					overlayAboveDrawer: true,
					pathPatterns: [projectExplorerSettingsPathPattern],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.deployButton)?.click();
						},
						label: t("sendEmail.steps.deployButton.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendEmail.steps.deployButton.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.manualRunButton,
					title: t("sendEmail.steps.manualRunButton.title", { ns: "tour" }),
					renderContent: renderManualRunStep,
					placement: "bottom",
					id: tourSteps.sendEmail.manualRunButton,
					overlayAboveDrawer: true,
					highlight: true,
					pathPatterns: [projectExplorerSettingsPathPattern],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.manualRunButton)?.click();
						},
						label: t("sendEmail.steps.manualRunButton.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendEmail.steps.manualRunButton.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.sessionsTopNav,
					title: t("sendEmail.steps.sessionsTopNav.title", { ns: "tour" }),
					content: t("sendEmail.steps.sessionsTopNav.content", { ns: "tour" }),
					placement: "bottom",
					id: tourSteps.sendEmail.sessionsTopNav,
					overlayAboveDrawer: true,
					highlight: true,
					pathPatterns: [projectExplorerSettingsPathPattern],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.sessionsTopNav)?.click();
						},
						label: t("sendEmail.steps.sessionsTopNav.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendEmail.steps.sessionsTopNav.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.sessionsRefresh,
					title: t("sendEmail.steps.sessionsRefresh.title", { ns: "tour" }),
					content: t("sendEmail.steps.sessionsRefresh.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					id: tourSteps.sendEmail.sessionsRefresh,
					pathPatterns: projectSessionsPathPatterns,
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.sessionsRefresh)?.click();
						},
						label: t("sendEmail.steps.sessionsRefresh.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendEmail.steps.sessionsRefresh.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.sessionsRefresh,
					title: t("sendEmail.steps.sessionsFinish.title", { ns: "tour" }),
					content: t("sendEmail.steps.sessionsFinish.content", { ns: "tour" }),
					placement: "bottom",
					id: tourSteps.sendEmail.sessionsFinish,
					highlight: true,
					pathPatterns: projectSessionsPathPatterns,
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.sessionsRefresh)?.click();
						},
						label: t("sendEmail.steps.sessionsFinish.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendEmail.steps.sessionsFinish.buttonAriaLabel", { ns: "tour" }),
					},
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
					htmlElementId: tourStepsHTMLIds.projectConfig,
					id: tourSteps.sendSlack.projectConfig,
					title: t("sendSlack.steps.projectConfig.title", { ns: "tour" }),
					content: t("sendSlack.steps.projectConfig.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [projectExplorerPathPattern],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.projectConfig)?.click();
						},
						label: t("sendSlack.steps.projectConfig.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendSlack.steps.projectConfig.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.editSlackConnection,
					id: tourSteps.sendSlack.editConnection,
					title: t("sendSlack.steps.editConnection.title", { ns: "tour" }),
					content: t("sendSlack.steps.editConnection.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [projectExplorerSettingsPathPattern],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.editSlackConnection)?.click();
						},
						label: t("sendSlack.steps.editConnection.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendSlack.steps.editConnection.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.slackOAuth,
					id: tourSteps.sendSlack.slackOAuth,
					title: t("sendSlack.steps.startOauth.content", { ns: "tour" }),
					content: t("sendSlack.steps.startOauth.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [projectExplorerConnectionsSectionPathPattern],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.slackOAuth)?.click();
						},
						label: t("sendSlack.steps.startOauth.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendSlack.steps.startOauth.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.oauthWait,
					title: t("sendSlack.steps.waitOauth.title", { ns: "tour" }),
					renderContent: renderOauthWaitStep,
					placement: "bottom",
					id: tourSteps.sendSlack.oauthWait,
					overlayAboveDrawer: true,
					hideBack: true,
					highlight: false,
					pathPatterns: [projectExplorerSettingsPathPattern],
				},
				{
					htmlElementId: tourStepsHTMLIds.deployButton,
					id: tourSteps.sendSlack.deployButton,
					title: t("sendSlack.steps.deployButton.title", { ns: "tour" }),
					content: t("sendSlack.steps.deployButton.content", { ns: "tour" }),
					overlayAboveDrawer: true,
					placement: "bottom",
					highlight: true,
					pathPatterns: [/^\/projects\/[^/]+\/connections$/],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.deployButton)?.click();
						},
						label: t("sendSlack.steps.deployButton.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendSlack.steps.deployButton.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.manualRunButton,
					id: tourSteps.sendSlack.manualRunButton,
					title: t("sendSlack.steps.manualRunButton.title", { ns: "tour" }),
					overlayAboveDrawer: true,
					renderContent: renderManualRunStep,
					placement: "bottom",
					highlight: true,
					pathPatterns: [/^\/projects\/[^/]+\/connections$/],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.manualRunButton)?.click();
						},
						label: t("sendSlack.steps.manualRunButton.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendSlack.steps.manualRunButton.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.sessionsTopNav,
					id: tourSteps.sendSlack.sessionsTopNav,
					title: t("sendSlack.steps.sessionsTopNav.title", { ns: "tour" }),
					overlayAboveDrawer: true,
					content: t("sendSlack.steps.sessionsTopNav.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [/^\/projects\/[^/]+\/connections$/],
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.sessionsTopNav)?.click();
						},
						label: t("sendSlack.steps.sessionsTopNav.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendSlack.steps.sessionsTopNav.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.sessionsRefresh,
					id: tourSteps.sendSlack.sessionsRefresh,
					title: t("sendSlack.steps.sessionsRefresh.title", { ns: "tour" }),
					content: t("sendSlack.steps.sessionsRefresh.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: projectSessionsPathPatterns,
					actionButton: {
						execute: () => {
							document.getElementById(tourStepsHTMLIds.sessionsRefresh)?.click();
						},
						label: t("sendSlack.steps.sessionsRefresh.buttonLabel", { ns: "tour" }),
						ariaLabel: t("sendSlack.steps.sessionsRefresh.buttonAriaLabel", { ns: "tour" }),
					},
				},
				{
					htmlElementId: tourStepsHTMLIds.sessionsRefresh,
					id: tourSteps.sendSlack.sessionsFinish,
					title: t("sendSlack.steps.sessionsFinish.title", { ns: "tour" }),
					content: t("sendSlack.steps.sessionsFinish.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: projectSessionsPathPatterns,
				},
			],
		},
	};

	verifyTourStepIdsUniqueness();
};

if (i18n.isInitialized) {
	initializeTours();
} else {
	i18n.on("initialized", initializeTours);
}

export const emptyTourStep: TourPopoverProps = {
	htmlElementId: "",
	title: "",
	content: "",
	customComponent: undefined,
	placement: "bottom" as Placement,
	hideBack: false,
	onPrev: () => {},
	onSkip: () => {},
	isFirstStep: false,
	isLastStep: false,
	visible: false,
};

export const maxRetriesElementGetInterval = 50;

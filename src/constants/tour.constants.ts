import i18n, { t } from "i18next";

import { TourId } from "@enums";
import { Tour } from "@src/interfaces/store";

import { renderCodeSettingsStep, renderManualRunStep } from "@components/organisms/tour/custom-tours-steps";

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
					id: "tourProjectCode",
					title: "tourProjectCode",
					renderContent: renderCodeSettingsStep,
					placement: "bottom",
					highlight: false,
					displayNext: true,
					pathPatterns: [/^\/projects\/[^/]+\/code$/],
				},
				{
					id: "tourDeployButton",
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
					id: "tourManualRunButton",
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
					id: "tourSessionsTopNav",
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
					id: "tourSessionsRefresh",
					title: t("quickstart.steps.sessionsRefresh.title", { ns: "tour" }),
					content: t("quickstart.steps.sessionsRefresh.content", { ns: "tour" }),
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
					id: "tourNavigateKnowledgeBase",
					title: t("quickstart.steps.navigateKnowledgeBase.title", { ns: "tour" }),
					content: t("quickstart.steps.navigateKnowledgeBase.content", { ns: "tour" }),
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
					id: "tourProjectConnectionsTab",
					title: t("sendEmail.steps.connections.title", { ns: "tour" }),
					content: t("sendEmail.steps.connections.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [/^\/projects\/[^/]+$/, /^\/projects\/[^/]+\/code$/],
				},
				{
					id: "tourEditgmail_connConnection",
					title: t("sendEmail.steps.editConnection.content", { ns: "tour" }),
					content: t("sendEmail.steps.editConnection.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [/^\/projects\/[^/]+\/connections$/],
				},
				{
					id: "tourGoogleOAuth",
					title: t("sendEmail.steps.startOauth.content", { ns: "tour" }),
					content: t("sendEmail.steps.startOauth.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					pathPatterns: [/^\/projects\/[^/]+\/connections$/, /^\/projects\/[^/]+\/connections\/[^/]+\/edit$/],
				},
				{
					id: "tourDeployButton",
					title: t("sendEmail.steps.deployButton.title", { ns: "tour" }),
					content: t("sendEmail.steps.deployButton.content", { ns: "tour" }),
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
					id: "tourManualRunButton",
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
					id: "tourSessionsTopNav",
					title: t("sendEmail.steps.sessionsTopNav.title", { ns: "tour" }),
					content: t("sendEmail.steps.sessionsTopNav.content", { ns: "tour" }),
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
					id: "tourSessionsRefresh",
					title: t("sendEmail.steps.sessionsRefresh.title", { ns: "tour" }),
					content: t("sendEmail.steps.sessionsRefresh.content", { ns: "tour" }),
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
});

export const delayedSteps = ["tourSessionsTopNav", "tourEditgmail_connConnection"];

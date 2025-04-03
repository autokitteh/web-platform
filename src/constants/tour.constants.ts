import i18n, { t } from "i18next";

import { TourId } from "@enums";
import { Tour } from "@src/interfaces/store";

import { renderCodeSettingsStep, renderManualRunStep } from "@components/organisms/tour/custom-tours-steps";

export let tours: Record<string, Tour> = {};

i18n.on("initialized", () => {
	tours = {
		[TourId.quickstart]: {
			id: TourId.quickstart,
			name: t("quickstart.name", { ns: "tour" }),
			title: t("quickstart.title", { ns: "tour" }),
			description: t("quickstart.description", { ns: "tour" }),
			assetDirectory: "quickstart",
			defaultFile: "program.py",
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
			],
		},
	};
});

export const delayedSteps = ["tourSessionsTopNav"];

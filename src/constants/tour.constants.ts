import i18n, { t } from "i18next";

import { TourId } from "@enums";
import { Tour } from "@src/interfaces/store";

import { renderCodeSettingsStep, renderManualRunStep } from "@components/organisms/tour/custom-tours-steps";

export let tours: Record<string, Tour> = {};

i18n.on("initialized", () => {
	tours = {
		[TourId.onboarding]: {
			id: TourId.onboarding,
			name: t("onboarding.name", { ns: "tour" }),
			steps: [
				{
					id: "tourProjectCode",
					title: "tourProjectCode",
					renderContent: renderCodeSettingsStep,
					placement: "bottom",
					highlight: false,
					displayNext: true,
				},
				{
					id: "tourDeployButton",
					title: t("onboarding.steps.deployButton.title", { ns: "tour" }),
					content: t("onboarding.steps.deployButton.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
				},
				{
					id: "tourManualRunButton",
					title: "tourManualRunButton",
					renderContent: renderManualRunStep,
					placement: "bottom",
					highlight: true,
				},
				{
					id: "tourSessionsTopNav",
					title: t("onboarding.steps.sessionsTopNav.title", { ns: "tour" }),
					content: t("onboarding.steps.sessionsTopNav.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
				},
				{
					id: "tourSessionsRefresh",
					title: t("onboarding.steps.sessionsRefresh.title", { ns: "tour" }),
					content: t("onboarding.steps.sessionsRefresh.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
				},
			],
		},
		[TourId.gmailTemplate]: {
			id: TourId.gmailTemplate,
			name: t("gmailTemplate.name", { ns: "tour" }),
			steps: [
				{
					id: "tourProjectCode",
					title: "tourProjectCode",
					renderContent: renderCodeSettingsStep,
					placement: "bottom",
					highlight: false,
					displayNext: true,
				},
				{
					id: "tourProjectConnections",
					title: t("gmailTemplate.steps.connections.title", { ns: "tour" }),
					content: t("gmailTemplate.steps.connections.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
				},
			],
		},
	};
});

export const delayedSteps = ["tourSessionsTopNav"];

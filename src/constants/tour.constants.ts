import i18n, { t } from "i18next";

import { TourId } from "@enums";
import { Tour } from "@src/interfaces/store";

import { renderOnboardingCodeSettingsStep } from "@components/organisms/tour/custom-tours-steps";

export let tours: Record<string, Tour> = {};

i18n.on("initialized", () => {
	tours = {
		[TourId.onboarding]: {
			id: TourId.onboarding,
			name: t("onboarding.name", { ns: "tour" }),
			navigateOnComplete: "/projects/:projectId/sessions",
			steps: [
				{
					id: "tourProjectCode",
					targetElementId: "tourProjectCode",
					title: "tourProjectCode",
					renderContent: renderOnboardingCodeSettingsStep,
					placement: "bottom",
					highlight: false,
					actionElementId: "tourDeployButton",
					displayNext: true,
				},
				{
					id: "tourDeployButton",
					targetElementId: "tourDeployButton",
					title: t("onboarding.steps.deployButton.title", { ns: "tour" }),
					content: t("onboarding.steps.deployButton.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					actionElementId: "tourDeployButton",
				},
				{
					id: "tourManualRunButton",
					targetElementId: "tourManualRunButton",
					title: t("onboarding.steps.manualRunButton.title", { ns: "tour" }),
					content: t("onboarding.steps.manualRunButton.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					actionElementId: "tourManualRunButton",
				},
				{
					id: "tourSessionsTopNav",
					targetElementId: "tourSessionsTopNav",
					title: t("onboarding.steps.sessionsTopNav.title", { ns: "tour" }),
					content: t("onboarding.steps.sessionsTopNav.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					actionElementId: "tourSessionsTopNav",
				},
				{
					id: "tourSessionsRefresh",
					targetElementId: "tourSessionsRefresh",
					title: t("onboarding.steps.sessionsRefresh.title", { ns: "tour" }),
					content: t("onboarding.steps.sessionsRefresh.content", { ns: "tour" }),
					placement: "bottom",
					highlight: true,
					actionElementId: "tourSessionsRefresh",
				},
			],
		},
	};
});

export const delayedSteps = ["tourSessionsTopNav"];

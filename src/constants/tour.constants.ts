import { t } from "i18next";
import { TourId } from "@enums";
import { Tour } from "@src/interfaces/store";

export const tours: Record<string, Tour> = {
    [TourId.onboarding]: {
        id: TourId.onboarding,
        name: t("onboarding.name", { ns: "tour" }),
        navigateOnComplete: "/projects/:projectId/sessions",
        steps: [
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
        ],
    },
};
import { TourId } from "@enums";
import { Tour } from "@store/useTourStore";

export const tours: Record<string, Tour> = {
	[TourId.onboarding]: {
		id: TourId.onboarding,
		name: "Onboarding Tour",
		steps: [
			{
				id: "tourDeployButton",
				targetElementId: "tourDeployButton",
				title: "Deploy Project",
				content: "Click here to deploy your project after building.",
				placement: "bottom",
				highlight: true,
			},
			{
				id: "tourManualRunButton",
				targetElementId: "tourManualRunButton",
				title: "Manual Run",
				content: "Manually run your deployed project to test it.",
				placement: "bottom",
				highlight: true,
			},
			{
				id: "tourSessionsTopNav",
				targetElementId: "tourSessionsTopNav",
				title: "View Sessions",
				content: "View all execution sessions for your project here.",
				placement: "bottom",
				highlight: true,
			},
		],
	},
};

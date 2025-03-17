import { TourId } from "@enums";
import { Tour } from "@src/interfaces/store";

export const tours: Record<string, Tour> = {
	[TourId.onboarding]: {
		id: TourId.onboarding,
		name: "Onboarding Tour",
		steps: [
			{
				id: "tourDeployButton",
				targetElementId: "tourDeployButton",
				title: "Deploy Project",
				content: "Click to deploy your project's code",
				placement: "bottom",
				highlight: true,
				actionElementId: "tourDeployButton",
			},
			{
				id: "tourManualRunButton",
				targetElementId: "tourManualRunButton",
				title: "Manual Run",
				content: "Manually run your deployed project to test it",
				placement: "bottom",
				highlight: true,
				actionElementId: "tourManualRunButton",
			},
			{
				id: "tourSessionsTopNav",
				targetElementId: "tourSessionsTopNav",
				title: "View Sessions",
				content: "View all sessions for your project here",
				placement: "bottom",
				highlight: true,
				actionElementId: "tourSessionsTopNav",
			},
		],
	},
};

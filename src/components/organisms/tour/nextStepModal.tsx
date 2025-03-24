import React from "react";

import { useTranslation } from "react-i18next";

import { Button, Typography } from "@components/atoms";
import { Accordion, Modal } from "@components/molecules";

import { CheckCircleIcon, EmptyCircleIcon } from "@assets/image/icons";

interface NextStepModalProps {
	completedSteps: string[];
	onStepSelect: (stepId: string) => void;
}

export interface TutorialStep {
	id: string;
	title: string;
	description: string;
}

export const NextStepModal: React.FC<NextStepModalProps> = ({ completedSteps, onStepSelect }) => {
	const { t } = useTranslation("tutorial", { keyPrefix: "tutorial.nextStepModal" });

	const tutorialSteps: TutorialStep[] = [
		{
			id: "first-step",
			title: t("steps.firstStep.title"),
			description: t("steps.firstStep.description"),
		},
		{
			id: "gmail-connect",
			title: t("steps.gmailConnect.title"),
			description: t("steps.gmailConnect.description"),
		},
		{
			id: "slack-connect",
			title: t("steps.slackConnect.title"),
			description: t("steps.slackConnect.description"),
		},
	];

	const progress = Math.round(((completedSteps?.length || 0) / (tutorialSteps?.length || 1)) * 100);

	return (
		<Modal
			className="mb-[20px] ml-[72px] w-72 p-5"
			hideBg
			name="nextStepModal"
			wrapperClass="justify-start items-end"
		>
			<div className="flex h-full flex-col">
				<Typography className="mb-4 text-xl font-semibold text-gray-1200" element="h2">
					{t("title")}
				</Typography>

				{/* Progress bar */}
				<div className="my-4 h-2 w-full rounded-full bg-gray-750">
					<div
						className="h-full rounded-full bg-green-800 transition-all duration-300"
						style={{ width: `${progress}%` }}
					/>
				</div>

				<Typography className="mb-5 text-gray-1200" element="p">
					{t("description")}
				</Typography>

				<div className="flex flex-col gap-2 overflow-y-auto">
					{tutorialSteps.map((step) => (
						<Accordion
							classChildren="py-1 px-2 text-gray-1200"
							classIcon="fill-green-500 size-5"
							classNameButton="py-0.5 text-gray-1200"
							constantIcon={completedSteps?.includes(step.id) ? CheckCircleIcon : EmptyCircleIcon}
							hideDivider
							key={step.id}
							title={
								<div className="flex w-full items-center justify-between">
									<Typography className="font-semibold" element="span">
										{step.title}
									</Typography>
								</div>
							}
						>
							<Typography className="mb-2 mt-1 text-gray-1200" element="p">
								{step.description}
							</Typography>
							{completedSteps?.includes(step.id) ? null : (
								<Button
									ariaLabel={t("startButton")}
									className="mb-1.5 h-6 bg-green-800 px-4 pt-3 font-semibold text-gray-1100 hover:bg-green-200"
									onClick={() => onStepSelect(step.id)}
									variant="filled"
								>
									{t("startButton")}
								</Button>
							)}
						</Accordion>
					))}
				</div>
			</div>
		</Modal>
	);
};

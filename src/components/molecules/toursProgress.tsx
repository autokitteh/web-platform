import React from "react";

import { useTranslation } from "react-i18next";

import { tours } from "@constants";
import { ModalName } from "@src/enums/components";
import { TutorialProgressModalProps } from "@src/interfaces/store";

import { Button, Loader, Typography } from "@components/atoms";
import { Accordion, Modal } from "@components/molecules";

import { CheckCircleIcon, EmptyCircleIcon } from "@assets/image/icons";

export const ToursProgress = ({ completedSteps, onStepSelect, isStarting }: TutorialProgressModalProps) => {
	const { t } = useTranslation("tour", { keyPrefix: "toursProgress" });

	const allTours = Object.values(tours);

	const progress = Math.round(((completedSteps?.length || 0) / (allTours?.length || 1)) * 100);

	return (
		<Modal
			className="mb-[20px] ml-[72px] w-72 p-5"
			focusTabIndexOnLoad={0}
			hideBg
			name={ModalName.toursProgress}
			wrapperClass="absolute left-0 bottom-0 w-auto h-fit top-auto"
		>
			<div className="flex h-full flex-col">
				<Typography className="mb-4 text-xl font-semibold text-gray-1200" element="h1">
					{t("title")}
				</Typography>

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
					{allTours.map(({ id, name, description }) => (
						<Accordion
							classChildren="py-1 px-2 text-gray-1200"
							classIcon="fill-green-500 size-5"
							classNameButton="py-0.5 text-gray-1200"
							constantIcon={completedSteps?.includes(id) ? CheckCircleIcon : EmptyCircleIcon}
							hideDivider
							key={id}
							title={
								<div className="flex w-full items-center justify-between">
									<Typography className="font-semibold" element="span">
										{name}
									</Typography>
								</div>
							}
						>
							<Typography className="mb-2 mt-1 text-gray-1200" element="p">
								{description}
							</Typography>
							{completedSteps?.includes(id) ? null : (
								<Button
									ariaLabel={t("startButton")}
									className="mb-1.5 h-6 bg-green-800 px-4 py-3 font-semibold text-gray-1100 hover:bg-green-200"
									disabled={isStarting}
									onClick={() => onStepSelect(id)}
									variant="filled"
								>
									{isStarting ? <Loader size="sm" /> : t("startButton")}
								</Button>
							)}
						</Accordion>
					))}
				</div>
			</div>
		</Modal>
	);
};

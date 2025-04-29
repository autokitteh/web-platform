import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { tours } from "@constants";
import { ModalName } from "@src/enums/components";
import { TutorialProgressModalProps } from "@src/interfaces/store";
import { useModalStore, useProjectStore, useTemplatesStore } from "@src/store";

import { Button, Loader, RadioButton, Typography } from "@components/atoms";
import { LoadingOverlay, Modal } from "@components/molecules";

export const ToursProgressStepper = ({ onStepStart, isStarting }: TutorialProgressModalProps) => {
	const { t } = useTranslation("tour", { keyPrefix: "toursProgress" });
	const { isLoading } = useTemplatesStore();
	const { pathname } = useLocation();
	const { closeModal } = useModalStore();

	useEffect(() => {
		if (!pathname.includes("/intro")) {
			closeModal(ModalName.toursProgress);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	const allTours = Object.values(tours);
	const { projectsList } = useProjectStore();
	const completedTours = projectsList
		.filter((project) => Object.keys(tours).includes(project.name))
		.map((project) => project.name);

	const progress = Math.round(((completedTours?.length || 0) / (allTours?.length || 1)) * 100);

	return (
		<Modal
			className="w-72 p-5"
			focusTabIndexOnLoad={0}
			hideOverlay
			name={ModalName.toursProgress}
			wrapperClass="absolute left-20 bottom-6 w-auto h-fit top-auto"
		>
			{isLoading ? <LoadingOverlay isLoading={isLoading} /> : null}
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

				<div className="flex flex-col gap-2 overflow-visible">
					{allTours.map(({ id, name }) => (
						<div className="flex w-full items-center justify-between" key={id}>
							<div className="flex items-center">
								<RadioButton
									checked={completedTours?.includes(id)}
									className="mr-2"
									disabled={completedTours?.includes(id)}
									id={id}
									label={name}
									name="tours"
									onChange={() => onStepStart(id)}
									value={id}
								/>
							</div>
							{completedTours?.includes(id) ? null : (
								<Button
									ariaLabel={t("startButton")}
									className="h-6 bg-green-800 px-4 py-3 font-semibold text-gray-1100 hover:bg-green-200"
									disabled={isStarting[id] || completedTours?.includes(id)}
									onClick={() => onStepStart(id)}
									variant="filled"
								>
									{isStarting[id] ? <Loader size="sm" /> : t("startButton")}
								</Button>
							)}
						</div>
					))}
				</div>
			</div>
		</Modal>
	);
};

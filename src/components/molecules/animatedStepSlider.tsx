import React, { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { Typography } from "@components/atoms";

interface StepSliderProps {
	currentStepIndex: number;
}

export const AnimatedStepSlider = ({ currentStepIndex }: StepSliderProps) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "ai.journey" });
	const [displayedStep, setDisplayedStep] = useState(currentStepIndex);

	const steps = [
		{ id: "describe", number: 1 },
		{ id: "preview", number: 2 },
		{ id: "deploy", number: 3 },
		{ id: "share", number: 4 },
		{ id: "yourTurn", number: 5 },
	];

	useEffect(() => {
		setDisplayedStep(currentStepIndex);
	}, [currentStepIndex]);

	useEffect(() => {
		if (displayedStep >= steps.length - 1) return;

		const timer = setInterval(() => {
			setDisplayedStep((prev) => {
				if (prev < steps.length - 1) {
					return prev + 1;
				}
				return prev;
			});
		}, 2500);

		return () => clearInterval(timer);
	}, [displayedStep, steps.length]);

	const currentStep = steps[displayedStep];

	return (
		<div className="relative flex flex-row items-center justify-center gap-6 rounded-2xl bg-[rgba(26,26,26,0.4)] p-6 backdrop-blur-sm">
			{/* <div className="flex items-center gap-3">
				{steps.map((step, index) => {
					const isCompleted = index < displayedStep;
					const isCurrent = isProcessing(index);
					const isFuture = index > displayedStep;

					return (
						<motion.div
							animate={{
								scale: isCurrent ? 1.2 : 1,
								opacity: isFuture ? 0.3 : 1,
							}}
							className="relative"
							initial={{ scale: 0.8 }}
							key={step.id}
							transition={{ type: "spring", stiffness: 300, damping: 20 }}
						>
							<div
								className="relative flex size-3 items-center justify-center rounded-full bg-green-500 transition-all duration-300"
								style={{
									boxShadow: isCurrent ? "0 0 20px 8px rgba(126,211,33,0.6)" : "none",
									opacity: isCompleted ? 0.7 : 1,
								}}
							/>
							{isCurrent ? (
								<>
									<motion.div
										animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.2, 0.6] }}
										className="absolute inset-0 rounded-full bg-green-500"
										initial={{ scale: 1 }}
										style={{ filter: "blur(8px)" }}
										transition={{
											duration: 1.5,
											repeat: Number.POSITIVE_INFINITY,
											ease: "easeInOut",
										}}
									/>
									<motion.div
										animate={{ rotate: 360 }}
										className="absolute inset-0 rounded-full border-2 border-green-500 border-t-transparent"
										transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
									/>
								</>
							) : null}
						</motion.div>
					);
				})}
			</div> */}

			<div className="relative flex w-full items-center justify-center">
				<AnimatePresence mode="wait">
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="flex items-center justify-center"
						exit={{ opacity: 0, x: -50 }}
						initial={{ opacity: 0, x: 50 }}
						key={displayedStep}
						transition={{ duration: 0.4, ease: "easeInOut" }}
					>
						{currentStep.id === "yourTurn" ? (
							<div className="flex items-center justify-center p-4">
								<Typography
									className="text-center text-lg font-bold text-green-500"
									element="span"
									style={{
										textShadow: "0 0 20px rgba(126,211,33,0.6), 0 0 40px rgba(126,211,33,0.3)",
									}}
								>
									{t(`steps.${currentStep.id}`)}
								</Typography>
							</div>
						) : (
							<div className="flex items-center gap-4 p-4">
								<div
									className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[rgba(126,211,33,0.1)]"
									style={{
										boxShadow: "0 0 20px 5px rgba(126,211,33,0.3)",
									}}
								>
									<Typography className="text-lg font-bold text-green-500" element="span">
										{currentStep.number}
									</Typography>
								</div>
								<div className="flex flex-col items-start">
									<div className="flex items-center gap-2">
										<Typography className="text-base font-semibold text-white" element="span">
											{t(`steps.${currentStep.id}`)}
										</Typography>
										<motion.div
											animate={{ opacity: [1, 0.3, 1] }}
											className="flex gap-1"
											transition={{
												duration: 1.5,
												repeat: Number.POSITIVE_INFINITY,
												ease: "easeInOut",
											}}
										>
											<span className="size-1.5 rounded-full bg-green-500" />
											<span className="size-1.5 rounded-full bg-green-500" />
											<span className="size-1.5 rounded-full bg-green-500" />
										</motion.div>
									</div>
									<Typography className="text-xs text-gray-400" element="span">
										{t("stepLabel", { current: displayedStep + 1, total: steps.length })}
									</Typography>
								</div>
							</div>
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
};

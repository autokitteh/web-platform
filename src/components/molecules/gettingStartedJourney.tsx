import React, { useEffect, useState } from "react";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { cn } from "@src/utilities";

import { Typography } from "@components/atoms";

interface JourneyStep {
	id: string;
	completed: boolean;
	active?: boolean;
}

interface GettingStartedJourneyProps {
	steps: JourneyStep[];
}

export const GettingStartedJourney = ({ steps: initialSteps }: GettingStartedJourneyProps) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "ai.journey" });
	const [steps, setSteps] = useState(initialSteps);

	useEffect(() => {
		setSteps(initialSteps);
	}, [initialSteps]);

	useEffect(() => {
		const currentIndex = steps.findIndex((step) => !step.completed);
		if (currentIndex === -1) return;

		const timer = setInterval(() => {
			setSteps((prevSteps) => {
				const currentIdx = prevSteps.findIndex((step) => !step.completed);
				if (currentIdx === -1) return prevSteps;

				return prevSteps.map((step, index) => {
					if (index === currentIdx) {
						return { ...step, completed: true, active: false };
					} else if (index === currentIdx + 1) {
						return { ...step, active: true };
					}
					return step;
				});
			});
		}, 2500);

		return () => clearInterval(timer);
	}, [steps]);

	const completedCount = steps.filter((step) => step.completed).length;
	const totalSteps = steps.length;
	const progressPercentage = (completedCount / totalSteps) * 100;

	return (
		<div className="w-full rounded-2xl border-2 border-[rgba(126,211,33,0.2)] bg-[rgba(26,26,26,0.6)] p-6 backdrop-blur-[10px]">
			<div className="mb-4 flex items-center justify-between">
				<Typography className="text-lg font-bold text-white" element="h3">
					{t("title")}
				</Typography>
				<span className="text-sm text-gray-400">
					{completedCount}/{totalSteps} {t("completed")}
				</span>
			</div>

			<div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-700">
				<div
					className="h-full bg-gradient-to-r from-[#7ed321] to-[#9aff3d] transition-all duration-500 ease-out"
					style={{ width: `${progressPercentage}%` }}
				/>
			</div>

			<div className="space-y-3">
				{steps.map((step) => (
					<div className="flex items-center gap-3" key={step.id}>
						<div
							className={cn(
								"relative flex size-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-300",
								step.completed
									? "border-green-500 bg-green-500"
									: step.active
										? "border-green-500 bg-transparent"
										: "border-gray-600 bg-transparent"
							)}
						>
							{step.completed ? (
								<svg
									className="size-3 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M5 13l4 4L19 7"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
									/>
								</svg>
							) : null}
							{step.active && !step.completed ? (
								<motion.div
									animate={{ rotate: 360 }}
									className="absolute inset-0 rounded border-2 border-green-500 border-t-transparent"
									transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
								/>
							) : null}
						</div>
						<div className="flex items-center gap-2">
							<Typography
								className={cn(
									"text-sm transition-colors duration-300",
									step.completed
										? "text-gray-400 line-through"
										: step.active
											? "font-medium text-white"
											: "text-white"
								)}
								element="span"
							>
								{t(`steps.${step.id}`)}
							</Typography>
							{step.active && !step.completed ? (
								<motion.div
									animate={{ opacity: [1, 0.3, 1] }}
									className="flex gap-0.5"
									transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
								>
									<span className="size-1 rounded-full bg-green-500" />
									<span className="size-1 rounded-full bg-green-500" />
									<span className="size-1 rounded-full bg-green-500" />
								</motion.div>
							) : null}
						</div>
					</div>
				))}
			</div>

			<div className="mt-4 flex items-center gap-2 border-t border-gray-700 pt-4">
				<svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
					/>
				</svg>
				<Typography className="text-xs text-gray-400" element="span">
					{t("averageTime")}
				</Typography>
			</div>
		</div>
	);
};

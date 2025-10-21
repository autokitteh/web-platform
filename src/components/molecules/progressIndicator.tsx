import React, { useEffect, useState } from "react";

import { motion } from "framer-motion";

import { cn } from "@src/utilities";

interface ProgressStep {
	number: number;
	label: string;
	completed: boolean;
	active: boolean;
}

interface ProgressIndicatorProps {
	steps: ProgressStep[];
}

export const ProgressIndicator = ({ steps: initialSteps }: ProgressIndicatorProps) => {
	const [steps, setSteps] = useState(initialSteps);

	useEffect(() => {
		setSteps(initialSteps);
	}, [initialSteps]);

	useEffect(() => {
		const currentIndex = steps.findIndex((step) => step.active);
		if (currentIndex === -1 || currentIndex >= steps.length - 1) return;

		const timer = setInterval(() => {
			setSteps((prevSteps) => {
				const activeIdx = prevSteps.findIndex((step) => step.active);
				if (activeIdx === -1 || activeIdx >= prevSteps.length - 1) return prevSteps;

				return prevSteps.map((step, index) => {
					if (index === activeIdx) {
						return { ...step, completed: true, active: false };
					} else if (index === activeIdx + 1) {
						return { ...step, active: true };
					}
					return step;
				});
			});
		}, 2500);

		return () => clearInterval(timer);
	}, [steps]);
	return (
		<div className="flex items-center justify-center gap-2 md:gap-4">
			{steps.map((step, index) => (
				<React.Fragment key={step.number}>
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"relative flex size-8 items-center justify-center rounded-full border-2 transition-all duration-300 md:size-10",
								step.completed
									? "border-green-500 bg-green-500 text-white"
									: step.active
										? "border-green-500 bg-transparent text-green-500"
										: "border-gray-600 bg-transparent text-gray-600"
							)}
						>
							{step.completed ? (
								<svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										d="M5 13l4 4L19 7"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
									/>
								</svg>
							) : (
								<span className="text-sm font-bold md:text-base">{step.number}</span>
							)}
							{step.active && !step.completed ? (
								<motion.div
									animate={{ rotate: 360 }}
									className="absolute inset-0 rounded-full border-2 border-green-500 border-t-transparent"
									transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
								/>
							) : null}
						</div>
						<div className="flex items-center gap-1.5">
							<span
								className={cn(
									"hidden text-sm font-medium transition-colors duration-300 md:inline",
									step.completed || step.active ? "text-white" : "text-gray-500"
								)}
							>
								{step.label}
							</span>
							{step.active && !step.completed ? (
								<motion.div
									animate={{ opacity: [1, 0.3, 1] }}
									className="hidden gap-0.5 md:flex"
									transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
								>
									<span className="size-1 rounded-full bg-green-500" />
									<span className="size-1 rounded-full bg-green-500" />
									<span className="size-1 rounded-full bg-green-500" />
								</motion.div>
							) : null}
						</div>
					</div>
					{index < steps.length - 1 ? (
						<div
							className={cn(
								"h-0.5 w-8 transition-colors duration-300 md:w-12",
								step.completed ? "bg-green-500" : "bg-gray-600"
							)}
						/>
					) : null}
				</React.Fragment>
			))}
		</div>
	);
};

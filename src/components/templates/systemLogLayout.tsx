import React, { useId } from "react";

import { useLocation } from "react-router-dom";

import { defaultSystemLogSize } from "@src/constants";
import { TourId } from "@src/enums";
import { useResize, useWindowDimensions, useCreateProjectFromTemplate } from "@src/hooks";
import { useLoggerStore, useModalStore, useTourStore } from "@src/store";
import { cn } from "@src/utilities";

import { ResizeButton } from "@components/atoms";
import { SystemLog } from "@components/organisms";
import { NextStepModal } from "@components/organisms/tour";

export const SystemLogLayout = ({
	children,
	className,
	sidebar,
	topbar,
	hideSystemLog,
}: {
	children: React.ReactNode;
	className?: string;
	hideSystemLog?: boolean;
	sidebar?: React.ReactNode;
	topbar?: React.ReactNode;
}) => {
	const layoutClasses = cn("flex h-screen w-screen flex-1 md:pr-4", className);
	const { pathname } = useLocation();
	const { setSystemLogHeight, systemLogHeight } = useLoggerStore();
	const { createProjectFromAsset } = useCreateProjectFromTemplate();
	const { closeModal } = useModalStore();

	const { isIOS, isMobile } = useWindowDimensions();

	const resizeId = useId();

	useResize({
		direction: "vertical",
		...defaultSystemLogSize,
		id: resizeId,
		value: systemLogHeight,
		onChange: (newVal) => {
			setSystemLogHeight(newVal);
		},
	});

	const buttonResizeClasses = cn("my-0.5", { "my-0": systemLogHeight === 100 });
	const innerLayoutClasses = cn("flex flex-1 flex-col md:mb-2", {
		"md:mb-0.5": systemLogHeight === 0,
		"w-0": ["/", "/intro"].includes(pathname),
	});

	const nextTour = (tourId: string) => {
		closeModal("nextStepModal");
		createProjectFromAsset("samples/google/gmail", "Gmail", "program.py", TourId.gmailTemplate);
	};

	return (
		<div className={layoutClasses}>
			{sidebar}
			<div className={innerLayoutClasses}>
				<div className="flex flex-1 flex-col overflow-hidden" style={{ height: `${100 - systemLogHeight}%` }}>
					{topbar}
					{children}
				</div>

				{isIOS || isMobile || hideSystemLog ? null : (
					<ResizeButton className={buttonResizeClasses} direction="vertical" resizeId={resizeId} />
				)}
				{hideSystemLog ? null : (
					<div className="z-20 overflow-hidden" style={{ height: `${systemLogHeight}%` }}>
						<SystemLog />
					</div>
				)}
			</div>
			<NextStepModal completedSteps={["first-step"]} onStepSelect={nextTour} />
		</div>
	);
};

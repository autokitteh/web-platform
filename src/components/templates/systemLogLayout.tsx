import React, { useId, useState } from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { defaultSystemLogSize } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useResize, useWindowDimensions, useTourActionListener } from "@src/hooks";
import { useLoggerStore, useModalStore, useToastStore, useTourStore } from "@src/store";
import { cn } from "@src/utilities";

import { ResizeButton } from "@components/atoms";
import { ToursProgressStepper } from "@components/molecules/toursProgressStepper";
import { SystemLog } from "@components/organisms";

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
	useTourActionListener();

	const { closeModal } = useModalStore();

	const { isIOS, isMobile } = useWindowDimensions();

	const [isStarting, setIsStarting] = useState(false);
	const { startTour } = useTourStore();
	const { addToast } = useToastStore();
	const navigate = useNavigate();
	const { t: tTours } = useTranslation("dashboard", { keyPrefix: "tours" });

	const startNewTour = async (tourId: string) => {
		setIsStarting(true);
		const newProjectData = await startTour(tourId);
		if (!newProjectData) {
			addToast({
				message: tTours("projectCreationFailed"),
				type: "error",
			});
			setIsStarting(false);
			return;
		}
		const { projectId, defaultFile } = newProjectData;

		navigate(`/projects/${projectId}`, {
			state: {
				fileToOpen: defaultFile,
			},
		});
		setIsStarting(false);
		closeModal(ModalName.toursProgress);
	};

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
			<ToursProgressStepper isStarting={isStarting} onStepSelect={(tourId: string) => startNewTour(tourId)} />
		</div>
	);
};

import { useCallback, useEffect, useId, useState, type ReactNode } from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultSystemLogSize } from "@src/constants";
import { EventListenerName, TourId } from "@src/enums";
import { DrawerName, ModalName } from "@src/enums/components";
import { useResize, useWindowDimensions, useTourActionListener, useEventListener } from "@src/hooks";
import { useLoggerStore, useModalStore, useToastStore, useTourStore, useSharedBetweenProjectsStore } from "@src/store";
import { cn, navigateToProject, useNavigateWithSettings, useCloseSettings } from "@src/utilities";

import { ResizeButton } from "@components/atoms";
import { ToursProgressStepper } from "@components/molecules/toursProgressStepper";
import { SystemLog } from "@components/organisms";
import { DiagramViewerModal } from "@components/organisms/modals/diagramViewerModal";

export const SystemLogLayout = ({
	children,
	className,
	sidebar,
	topbar,
	hideSystemLog,
}: {
	children: ReactNode;
	className?: string;
	hideSystemLog?: boolean;
	sidebar?: ReactNode;
	topbar?: ReactNode;
}) => {
	const layoutClasses = cn("flex h-screen flex-1 overflow-hidden", className);
	const location = useLocation();
	const { pathname } = location;
	const { projectId } = useParams();
	const { setSystemLogHeight, systemLogHeight } = useLoggerStore();
	useTourActionListener();
	const closeSettings = useCloseSettings();
	const { openDrawer, closeDrawer, isDrawerOpen } = useSharedBetweenProjectsStore();

	const { closeModal } = useModalStore();

	const { isIOS, isMobile } = useWindowDimensions();

	const [isStarting, setIsStarting] = useState<Record<TourId, boolean>>({
		[TourId.sendEmail]: false,
		[TourId.sendSlack]: false,
		[TourId.quickstart]: false,
	});
	const { startTour } = useTourStore();
	const { addToast } = useToastStore();
	const navigate = useNavigate();
	const { t: tTours } = useTranslation("dashboard", { keyPrefix: "tours" });
	const startNewTour = async (tourId: TourId) => {
		setIsStarting((prev) => ({ ...prev, [tourId]: true }));
		const { data: newProjectData, error: newProjectError } = await startTour(tourId);
		if (!newProjectData?.projectId || newProjectError) {
			addToast({
				message: tTours("projectCreationFailed"),
				type: "error",
			});
			setIsStarting((prev) => ({ ...prev, [tourId]: false }));
			return;
		}
		const { projectId, defaultFile } = newProjectData;

		navigateToProject(navigate, projectId, "/explorer", {
			fileToOpen: defaultFile,
		});
		setIsStarting((prev) => ({ ...prev, [tourId]: false }));
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
	const innerLayoutClasses = cn("mr-2 flex min-w-0 flex-1 flex-col md:mb-2", {
		"md:mb-0.5": systemLogHeight === 0,
		"w-0": ["/", "/intro"].includes(pathname),
		"mr-0": isMobile,
	});

	const navigateWithSettings = useNavigateWithSettings();

	useEffect(() => {
		if (!projectId) return;

		const isCurrentlyOnSettings = location.pathname.includes("/settings");
		const shouldBeOnSettings = isDrawerOpen(projectId, DrawerName.settings);

		if (shouldBeOnSettings && !isCurrentlyOnSettings) {
			navigateWithSettings("settings", { replace: true });
		}
	}, [projectId, location.pathname, isDrawerOpen, navigateWithSettings]);

	const handleDisplayProjectSettingsSidebar = useCallback(() => {
		if (!projectId) return;
		if (location.pathname.includes("/settings")) {
			return;
		}
		openDrawer(projectId, DrawerName.settings);
		navigateWithSettings("settings");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, location.pathname]);

	useEventListener(EventListenerName.displayProjectConfigSidebar, handleDisplayProjectSettingsSidebar);

	const handleCloseProjectSettingsSidebar = useCallback(() => {
		if (!projectId) return;
		closeDrawer(projectId, DrawerName.settings);
		closeSettings({ replace: true });
	}, [projectId, closeDrawer, closeSettings]);

	useEventListener(EventListenerName.hideProjectConfigSidebar, handleCloseProjectSettingsSidebar);

	return (
		<div className={layoutClasses}>
			{sidebar}
			<div className={innerLayoutClasses}>
				<div className="flex flex-1 flex-col" style={{ height: `${100 - systemLogHeight}%` }}>
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
			<ToursProgressStepper isStarting={isStarting} onStepStart={(tourId: TourId) => startNewTour(tourId)} />
			<DiagramViewerModal />
		</div>
	);
};

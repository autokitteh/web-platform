import React, { useId, useMemo } from "react";

import { useParams, useLocation } from "react-router-dom";

import { TourId } from "@enums";
import { SplitFrameProps } from "@interfaces/components";
import { defaultSplitFrameSize, tourStepsHTMLIds } from "@src/constants";
import { useWindowDimensions, useResize } from "@src/hooks";
import { useSharedBetweenProjectsStore, useTourStore } from "@src/store";
import { cn } from "@utilities";

import { Frame, ResizeButton } from "@components/atoms";
import { EditorTabs } from "@components/organisms";

export const SplitFrame = ({ children, rightFrameClass: rightBoxClass }: SplitFrameProps) => {
	const resizeHorizontalId = useId();
	const { projectSplitScreenWidth, setProjectSplitScreenWidth, isProjectFilesVisible, setIsProjectFilesVisible } =
		useSharedBetweenProjectsStore();
	const { projectId } = useParams();
	const { pathname } = useLocation();
	const { activeTour } = useTourStore();
	const { isMobile, isTablet } = useWindowDimensions();

	const isMobileOrTablet = isMobile || isTablet;

	const [leftSideWidth] = useResize({
		direction: "horizontal",
		...defaultSplitFrameSize,
		initial: projectSplitScreenWidth[projectId!] || defaultSplitFrameSize.initial,
		value: projectSplitScreenWidth[projectId!],
		id: resizeHorizontalId,
		onChange: (width) => setProjectSplitScreenWidth(projectId!, width),
	});

	const shouldShowProjectFiles = !!isProjectFilesVisible[projectId!];

	const isOnboardingTourActive = useMemo(() => {
		const isOnboardingTour = activeTour?.tourId === TourId.quickstart;
		const isProjectCodePage = pathname.includes(`/projects/${projectId}/explorer`);

		return isOnboardingTour && isProjectCodePage;
	}, [activeTour, pathname, projectId]);

	const isConnectionTourActive = useMemo(() => {
		const isConnectionsTour = [TourId.sendEmail.toString(), TourId.sendSlack.toString()].includes(
			activeTour?.tourId || ""
		);
		const isProjectConnectionsPage = pathname.includes(`/projects/${projectId}/explorer/settings`);

		return isConnectionsTour && isProjectConnectionsPage;
	}, [activeTour, pathname, projectId]);

	const rightFrameClass = cn(
		`h-full overflow-hidden rounded-l-none pb-0`,
		{
			"rounded-2xl": !children || leftSideWidth === 0 || !shouldShowProjectFiles || isMobileOrTablet,
		},
		rightBoxClass
	);

	const leftFrameClass = cn(`h-full flex-auto rounded-r-none border-r border-gray-1050 bg-gray-1100`, {
		"fixed inset-0 z-40 rounded-none border-0": isMobileOrTablet,
	});

	const handleCloseMobileFiles = () => {
		if (projectId) {
			setIsProjectFilesVisible(projectId, false);
		}
	};

	const showFilesPanel = leftSideWidth > 0 && shouldShowProjectFiles;
	const showDesktopFiles = showFilesPanel && !isMobileOrTablet;
	const showMobileFiles = showFilesPanel && isMobileOrTablet;

	return (
		<div className="flex size-full overflow-hidden">
			{showMobileFiles ? (
				<>
					<div
						aria-hidden="true"
						className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
						onClick={handleCloseMobileFiles}
					/>
					<div className="fixed inset-0 z-40 p-4">
						{children ? <Frame className={leftFrameClass}>{children}</Frame> : null}
					</div>
				</>
			) : null}

			{showDesktopFiles ? (
				<>
					<div style={{ width: `${leftSideWidth}%`, minWidth: 0 }}>
						{children ? <Frame className={leftFrameClass}>{children}</Frame> : null}
					</div>
					{isOnboardingTourActive ? (
						<div className="h-1/3 -translate-x-1/2" id={tourStepsHTMLIds.projectCode} />
					) : null}
					{isConnectionTourActive ? <div className="h-1/3" id={tourStepsHTMLIds.oauthWait} /> : null}

					<ResizeButton
						className="hover:bg-white"
						dataTestId="split-frame-resize-button"
						direction="horizontal"
						id="split-frame-resize-button"
						resizeId={resizeHorizontalId}
					/>
				</>
			) : null}

			<div className="relative flex items-center overflow-hidden" style={{ flex: 1 }}>
				<Frame className={rightFrameClass}>
					<EditorTabs />
				</Frame>
			</div>
		</div>
	);
};

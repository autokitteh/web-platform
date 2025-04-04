import React, { useId, useMemo } from "react";

import { useParams, useLocation } from "react-router-dom";

import { TourId } from "@enums";
import { SplitFrameProps } from "@interfaces/components";
import { defaultSplitFrameSize } from "@src/constants";
import { useSharedBetweenProjectsStore, useTourStore } from "@src/store";
import { cn } from "@utilities";

import { useResize } from "@hooks";

import { Frame, ResizeButton } from "@components/atoms";
import { EditorTabs } from "@components/organisms";

export const SplitFrame = ({ children }: SplitFrameProps) => {
	const resizeHorizontalId = useId();
	const { splitScreenRatio, fullScreenEditor, setEditorWidth } = useSharedBetweenProjectsStore();
	const { projectId } = useParams();
	const location = useLocation();
	const { activeTour } = useTourStore();

	const [leftSideWidth] = useResize({
		direction: "horizontal",
		...defaultSplitFrameSize,
		initial: splitScreenRatio[projectId!]?.assets || defaultSplitFrameSize.initial,
		id: resizeHorizontalId,
		onChange: (width) => setEditorWidth(projectId!, { assets: width }),
	});
	const isExpanded = React.useMemo(() => fullScreenEditor[projectId!], [fullScreenEditor, projectId]);

	const isOnboardingTourActive = useMemo(() => {
		const isOnboardingTour = activeTour?.tourId === TourId.quickstart;
		const isProjectCodePage = location.pathname.includes(`/projects/${projectId}/code`);

		return isOnboardingTour && isProjectCodePage;
	}, [activeTour, location.pathname, projectId]);

	const isConnectionTourActive = useMemo(() => {
		const isConnectionsTour = [TourId.sendEmail.toString(), TourId.sendSlack.toString()].includes(
			activeTour?.tourId || ""
		);
		const isProjectConnectionsPage = location.pathname.includes(`/projects/${projectId}/connections`);

		return isConnectionsTour && isProjectConnectionsPage;
	}, [activeTour, location.pathname, projectId]);

	const rightFrameClass = cn(`h-full overflow-hidden rounded-l-none pb-0`, {
		"rounded-2xl": !children || isExpanded,
	});

	const leftFrameClass = cn(`h-full flex-auto rounded-r-none border-r border-gray-1050 bg-gray-1100`);

	const rightSideWidth = isExpanded ? 100 : 100 - leftSideWidth;

	return (
		<div className="mt-1.5 flex size-full justify-end overflow-y-auto">
			{!isExpanded ? (
				<>
					<div style={{ width: `${leftSideWidth}%` }}>
						{children ? <Frame className={leftFrameClass}>{children}</Frame> : null}
					</div>
					{isOnboardingTourActive ? (
						<div
							className="h-1/3 -translate-x-1/2"
							id="tourProjectCode"
							style={{ left: `${defaultSplitFrameSize.initial}%` }}
						/>
					) : null}
					{isConnectionTourActive ? <div className="h-1/3" id="tourOAuthWait" /> : null}

					<ResizeButton className="hover:bg-white" direction="horizontal" resizeId={resizeHorizontalId} />
				</>
			) : null}

			<div className="relative flex items-center overflow-hidden" style={{ width: `${rightSideWidth}%` }}>
				<Frame className={rightFrameClass}>
					<EditorTabs />
				</Frame>
			</div>
		</div>
	);
};

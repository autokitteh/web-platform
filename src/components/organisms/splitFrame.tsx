import React, { useEffect, useId, useState } from "react";

import { useParams } from "react-router-dom";

import { SplitFrameProps } from "@interfaces/components";
import { defaultSplitFrameSize } from "@src/constants";
import { useProjectStore } from "@src/store";
import { cn } from "@utilities";

import { useResize } from "@hooks";

import { Frame, ResizeButton } from "@components/atoms";
import { EditorTabs } from "@components/organisms";

export const SplitFrame = ({ children }: SplitFrameProps) => {
	const resizeHorizontalId = useId();
	const { initialEditorWidths, setEditorWidth } = useProjectStore();
	const { projectId } = useParams();
	const [leftSideWidth] = useResize({
		direction: "horizontal",
		...defaultSplitFrameSize,
		initial: initialEditorWidths[projectId!]?.assets || defaultSplitFrameSize.initial,
		id: resizeHorizontalId,
	});
	const [isExpanded, setIsExpanded] = useState(false);

	const rightFrameClass = cn(`h-full overflow-hidden rounded-l-none pb-0`, {
		"rounded-2xl": !children || isExpanded,
	});

	useEffect(() => {
		setEditorWidth({ assets: leftSideWidth });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [leftSideWidth]);

	const leftFrameClass = cn(`h-full flex-auto rounded-r-none border-r border-gray-1050 bg-gray-1100`);

	const rightSideWidth = isExpanded ? 100 : 100 - leftSideWidth;

	return (
		<div className="mt-1.5 flex size-full justify-end overflow-y-auto">
			{!isExpanded ? (
				<>
					<div style={{ width: `${leftSideWidth}%` }}>
						{children ? <Frame className={leftFrameClass}>{children}</Frame> : null}
					</div>

					<ResizeButton className="hover:bg-white" direction="horizontal" resizeId={resizeHorizontalId} />
				</>
			) : null}

			<div className="relative flex items-center overflow-hidden" style={{ width: `${rightSideWidth}%` }}>
				<Frame className={rightFrameClass}>
					<EditorTabs isExpanded={isExpanded} setExpanded={(expandedState) => setIsExpanded(expandedState)} />
				</Frame>
			</div>
		</div>
	);
};

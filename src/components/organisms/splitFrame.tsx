import React, { useId } from "react";

import { SplitFrameProps } from "@interfaces/components";
import { defaultSplitFrameSize } from "@src/constants";
import { cn } from "@utilities";

import { useResize } from "@hooks";

import { Frame, LogoCatLarge, ResizeButton } from "@components/atoms";
import { EditorTabs, OutputTabs } from "@components/organisms";

export const SplitFrame = ({ children }: SplitFrameProps) => {
	const resizeHorizontalId = useId();
	const resizeVerticalId = useId();
	const [leftSideWidth] = useResize({
		direction: "horizontal",
		...defaultSplitFrameSize,
		id: resizeHorizontalId,
	});
	const [outputHeight] = useResize({ direction: "vertical", initial: 30, max: 90, min: 20, id: resizeVerticalId });

	const rightFrameClass = cn(`h-full overflow-hidden rounded-l-none pb-0`, {
		"rounded-2xl": !children,
	});

	const leftFrameClass = cn(`h-full flex-auto rounded-r-none border-r border-gray-1050 bg-gray-1100`);

	return (
		<div className="flex size-full justify-end py-1.5">
			<div style={{ width: `${leftSideWidth}%` }}>
				{children ? <Frame className={leftFrameClass}>{children}</Frame> : null}
			</div>

			<ResizeButton className="hover:bg-white" direction="horizontal" resizeId={resizeHorizontalId} />

			<div
				className="relative flex items-center overflow-hidden"
				style={{ width: `${100 - (leftSideWidth as number)}%` }}
			>
				<Frame className={rightFrameClass}>
					<div style={{ height: `${100 - (outputHeight as number)}%` }}>
						<EditorTabs />
					</div>

					<button
						className="z-0 -mx-8 cursor-ns-resize rounded-none bg-gray-1100 p-0.5 transition hover:bg-gray-750"
						data-resize-id={resizeVerticalId}
					/>

					<div
						className="z-0 -mx-8 border-0 border-t border-t-gray-1050 bg-black px-8 pt-5"
						style={{ height: `${outputHeight as number}%` }}
					>
						<OutputTabs />
					</div>
				</Frame>

				<LogoCatLarge />
			</div>
		</div>
	);
};

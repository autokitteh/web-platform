import React from "react";
import { Button, Frame, LogoCatLarge } from "@components/atoms";
import { EditorTabs, OutputTabs } from "@components/organisms";
import { useResize } from "@hooks";
import { SplitFrameProps } from "@interfaces/components";
import { cn } from "@utilities";

export const SplitFrame = ({ children }: SplitFrameProps) => {
	const [leftSideWidth] = useResize({ min: 35, max: 70, initial: 50, direction: "horizontal" });
	const [outputHeight] = useResize({ min: 20, max: 90, initial: 30, direction: "vertical" });

	const heightFrameClass = cn("h-[80vh] xl:h-[86vh] 2xl:h-[90vh]");
	const rightFrameClass = cn(`rounded-l-none pb-0 overflow-hidden`, {
		[heightFrameClass]: true,
		"rounded-2xl": !children,
	});

	const leftFrameClass = cn(`flex-auto bg-gray-800 border-r border-gray-600 rounded-r-none ${heightFrameClass}`);

	return (
		<div className="flex justify-end w-full">
			<div className="flex items-center" style={{ width: `${leftSideWidth}%` }}>
				{children ? <Frame className={leftFrameClass}>{children}</Frame> : null}
			</div>
			<div className="z-10 w-2 -ml-2 resize-handle-horizontal cursor-ew-resize" />
			<div className="flex items-center" style={{ width: `${100 - (leftSideWidth as number)}%` }}>
				<Frame className={rightFrameClass}>
					<div style={{ height: `${100 - (outputHeight as number)}%` }}>
						<EditorTabs />
					</div>
					<Button className="z-0 p-0.5 -mx-8 transition bg-gray-700 rounded-none cursor-ns-resize resize-handle-vertical hover:bg-gray-400" />
					<div
						className="z-0 px-8 pt-5 -mx-8 bg-black border-0 border-t border-t-gray-600"
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

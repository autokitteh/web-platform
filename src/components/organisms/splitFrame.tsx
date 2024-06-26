import React from "react";
import { Frame, LogoCatLarge } from "@components/atoms";
import { EditorTabs, OutputTabs } from "@components/organisms";
import { useResize } from "@hooks";
import { SplitFrameProps } from "@interfaces/components";
import { cn } from "@utilities";

export const SplitFrame = ({ children }: SplitFrameProps) => {
	const [leftSideWidth] = useResize({ min: 35, max: 70, initial: 50, direction: "horizontal" });
	const [outputHeight] = useResize({ min: 5, max: 95, initial: 30, direction: "vertical" });

	const mainFrameStyle = cn("rounded-l-none pb-0 overflow-hidden", { "rounded-2xl": !children });

	return (
		<div className="flex justify-end w-full ">
			<div className="flex" style={{ width: `${leftSideWidth}%` }}>
				{children ? (
					<Frame className="flex-auto bg-gray-800 border-r border-gray-600 rounded-r-none">{children}</Frame>
				) : null}
			</div>
			<div className="z-10 w-2 -ml-2 resize-handle-horizontal cursor-ew-resize" />
			<div style={{ width: `${100 - (leftSideWidth as number)}%` }}>
				<Frame className={mainFrameStyle}>
					<div className="flex flex-col h-full">
						<div style={{ height: `${100 - (outputHeight as number)}%` }}>
							<EditorTabs />
						</div>

						<div className="h-3 -mx-8 mt-8 cursor-ns-resize resize-handle-vertical z-40" />
						<div
							className="px-8 -mx-8 border-0 border-t pt-7 border-t-gray-600"
							style={{ height: `${outputHeight as number}%` }}
						>
							<OutputTabs />
						</div>
					</div>
				</Frame>
				<LogoCatLarge />
			</div>
		</div>
	);
};

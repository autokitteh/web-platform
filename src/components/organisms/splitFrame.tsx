import { Button, Frame, LogoCatLarge } from "@components/atoms";
import { EditorTabs, OutputTabs } from "@components/organisms";
import { useResize } from "@hooks";
import { SplitFrameProps } from "@interfaces/components";
import { cn } from "@utilities";
import React from "react";

export const SplitFrame = ({ children }: SplitFrameProps) => {
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 50, max: 70, min: 35 });
	const [outputHeight] = useResize({ direction: "vertical", initial: 30, max: 90, min: 20 });

	const heightFrameClass = cn("h-[80vh] xl:h-[86vh] 2xl:h-[90vh]");
	const rightFrameClass = cn(`rounded-l-none pb-0 overflow-hidden`, {
		[heightFrameClass]: true,
		"rounded-2xl": !children,
	});

	const leftFrameClass = cn(`flex-auto bg-gray-700 border-r border-gray-600 rounded-r-none ${heightFrameClass}`);

	return (
		<div className="flex justify-end w-full">
			<div className="flex items-center" style={{ width: `${leftSideWidth}%` }}>
				{children ? <Frame className={leftFrameClass}>{children}</Frame> : null}
			</div>

			<div className="-ml-2 cursor-ew-resize resize-handle-horizontal w-2 z-10" />

			<div
				className="flex items-center overflow-hidden relative"
				style={{ width: `${100 - (leftSideWidth as number)}%` }}
			>
				<Frame className={rightFrameClass}>
					<div style={{ height: `${100 - (outputHeight as number)}%` }}>
						<EditorTabs />
					</div>

					<Button className="-mx-8 bg-gray-700 cursor-ns-resize hover:bg-gray-400 p-0.5 resize-handle-vertical rounded-none transition z-0" />

					<div
						className="-mx-8 bg-black border-0 border-t border-t-gray-600 pt-5 px-8 z-0"
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

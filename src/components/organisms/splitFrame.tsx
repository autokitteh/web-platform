import React from "react";

import { SplitFrameProps } from "@interfaces/components";
import { cn } from "@utilities";

import { useResize } from "@hooks";

import { Button, Frame, LogoCatLarge } from "@components/atoms";
import { EditorTabs, OutputTabs } from "@components/organisms";

export const SplitFrame = ({ children }: SplitFrameProps) => {
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 50, max: 70, min: 35 });
	const [outputHeight] = useResize({ direction: "vertical", initial: 30, max: 90, min: 20 });

	const rightFrameClass = cn(`h-full overflow-hidden rounded-l-none pb-0`, {
		"rounded-2xl": !children,
	});

	const leftFrameClass = cn(`h-full flex-auto rounded-r-none border-r border-gray-1050 bg-gray-1100`);

	return (
		<div className="flex w-full justify-end py-2">
			<div className="flex items-center" style={{ width: `${leftSideWidth}%` }}>
				{children ? <Frame className={leftFrameClass}>{children}</Frame> : null}
			</div>

			{/* eslint-disable tailwindcss/no-custom-classname */}

			<div className="resize-handle-horizontal z-10 -ml-2 w-2 cursor-ew-resize" />

			<div
				className="relative flex items-center overflow-hidden"
				style={{ width: `${100 - (leftSideWidth as number)}%` }}
			>
				<Frame className={rightFrameClass}>
					<div style={{ height: `${100 - (outputHeight as number)}%` }}>
						<EditorTabs />
					</div>

					{}

					<Button className="resize-handle-vertical z-0 -mx-8 cursor-ns-resize rounded-none bg-gray-1100 p-0.5 transition hover:bg-gray-750" />

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

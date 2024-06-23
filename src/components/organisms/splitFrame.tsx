import React, { useState, useEffect } from "react";
import { Frame, LogoCatLarge } from "@components/atoms";
import { EditorTabs, OutputTabs } from "@components/organisms";
import { SplitFrameProps } from "@interfaces/components";
import { cn } from "@utilities";

export const SplitFrame = ({ children }: SplitFrameProps) => {
	const [leftWidth, setLeftWidth] = useState(50);
	const [outputHeight, setOutputHeight] = useState(30);

	const mainFrameStyle = cn("rounded-l-none pb-0 overflow-hidden", { "rounded-2xl": !children });

	const editorMinWidthPercent = 35;
	const editorMaxWidthPercent = 70;

	const outputMinHeightPercent = 5;
	const outputMaxHeightPercent = 95;

	const onResizeMouseDown = (event: MouseEvent) => {
		if (!(event.target instanceof HTMLElement) || !event.target.classList.contains("resize-handle")) return;

		if (event.target.classList.contains("resize-handle-horizontal")) {
			const startX = event.clientX;

			const doResize = (moveEvent: MouseEvent) => {
				const deltaX = moveEvent.clientX - startX;
				const newWidthPercent = (deltaX / window.innerWidth) * 100 + leftWidth;

				setLeftWidth(Math.max(editorMinWidthPercent, Math.min(editorMaxWidthPercent, newWidthPercent)));
			};

			const stopResizing = () => {
				document.removeEventListener("mousemove", doResize);
				document.removeEventListener("mouseup", stopResizing);
			};

			document.addEventListener("mousemove", doResize);
			document.addEventListener("mouseup", stopResizing);
			return;
		}

		const startY = event.clientY;

		const doHeightResize = (moveEvent: MouseEvent) => {
			const deltaY = startY - moveEvent.clientY;
			const newHeightPercent = (deltaY / window.innerHeight) * 100 + outputHeight;

			setOutputHeight(Math.max(outputMinHeightPercent, Math.min(outputMaxHeightPercent, newHeightPercent)));
		};

		const stopHeightResizing = () => {
			document.removeEventListener("mousemove", doHeightResize);
			document.removeEventListener("mouseup", stopHeightResizing);
		};

		document.addEventListener("mousemove", doHeightResize);
		document.addEventListener("mouseup", stopHeightResizing);
	};

	useEffect(() => {
		document.addEventListener("mousedown", onResizeMouseDown);

		return () => {
			document.removeEventListener("mousedown", onResizeMouseDown);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [leftWidth, outputHeight]);

	return (
		<div className="flex justify-end w-full h-full">
			<div className="flex" style={{ width: `${leftWidth}%` }}>
				{children ? (
					<Frame className="flex-auto bg-gray-800 border-r border-gray-600 rounded-r-none">{children}</Frame>
				) : null}
			</div>
			<div className="z-10 w-2 -ml-2 resize-handle resize-handle-horizontal cursor-ew-resize" />
			<div className="z-10 w-2 -mr-2 resize-handle resize-handle-horizontal cursor-ew-resize" />
			<div className="flex" style={{ width: `calc(100% - ${leftWidth}%)` }}>
				<Frame className={mainFrameStyle}>
					<EditorTabs key={outputHeight} />
					<div className="h-2 -mx-8 cursor-ns-resize resize-handle resize-handle-vertical " />
					<div className="px-8 -mx-8 border-0 border-t pt-7 border-t-gray-600" style={{ height: `${outputHeight}%` }}>
						<OutputTabs />
					</div>
				</Frame>
				<LogoCatLarge />
			</div>
		</div>
	);
};

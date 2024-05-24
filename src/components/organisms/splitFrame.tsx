import React, { useState, useEffect } from "react";
import { Frame, LogoCatLarge } from "@components/atoms";
import { EditorTabs, OutputTabs } from "@components/organisms";
import { SplitFrameProps } from "@interfaces/components";
import { cn } from "@utilities";

export const SplitFrame = ({ children }: SplitFrameProps) => {
	const [leftWidth, setLeftWidth] = useState(50);

	const mainFrameStyle = cn("rounded-l-none pb-0 overflow-hidden", { "rounded-2xl": !children });

	const minWidthPercent = 35;
	const maxWidthPercent = 70;

	const onKeyDown = (e: KeyboardEvent) => {
		const adjustment = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
		if (!adjustment) return;

		setLeftWidth((prevWidth) => Math.max(minWidthPercent, Math.min(maxWidthPercent, prevWidth + adjustment)));
	};
	const onResizeMouseDown = (event: MouseEvent) => {
		if (!(event.target instanceof HTMLElement) || !event.target.classList.contains("resize-handle")) return;

		const doResize = (moveEvent: MouseEvent) => {
			const deltaX = moveEvent.clientX - event.clientX;
			const newWidthPercent = (deltaX / window.innerWidth) * 100 + leftWidth;

			setLeftWidth(Math.max(minWidthPercent, Math.min(maxWidthPercent, newWidthPercent)));
		};

		const stopResizing = () => {
			document.removeEventListener("mousemove", doResize);
			document.removeEventListener("mouseup", stopResizing);
		};

		document.addEventListener("mousemove", doResize);
		document.addEventListener("mouseup", stopResizing);
	};

	useEffect(() => {
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("mousedown", onResizeMouseDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("mousedown", onResizeMouseDown);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [leftWidth]);

	return (
		<div className="flex justify-end w-full h-full">
			<div className="flex" style={{ width: `${leftWidth}%` }}>
				{children ? (
					<Frame className="flex-auto bg-gray-800 border-r border-gray-600 rounded-r-none">{children}</Frame>
				) : null}
			</div>
			<div className="z-10 w-2 -ml-2 resize-handle cursor-ew-resize" />
			<div className="z-10 w-2 -mr-2 resize-handle cursor-ew-resize" />
			<div className="flex" style={{ width: `calc(100% - ${leftWidth}%)` }}>
				<Frame className={mainFrameStyle}>
					<EditorTabs />
					<div className="px-8 -mx-8 border-0 border-t pt-7 border-t-gray-600">
						<OutputTabs />
					</div>
				</Frame>
				<LogoCatLarge />
			</div>
		</div>
	);
};

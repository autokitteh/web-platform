import React, { useState, useEffect } from "react";
import { LogoFrame } from "@assets/image";
import { Frame } from "@components/atoms";
import { EditorTabs, OutputTabs } from "@components/organisms";
import { ISplitFrame } from "@interfaces/components";
import { cn } from "@utilities";

export const SplitFrame = ({ children }: ISplitFrame) => {
	const [leftWidth, setLeftWidth] = useState(50);

	const baseStyle = cn("flex justify-end h-full w-full");
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
	}, [leftWidth]);

	return (
		<div className={baseStyle}>
			<div className="flex" style={{ width: `${leftWidth}%` }}>
				{children ? (
					<Frame className="rounded-r-none border-r border-gray-600 bg-gray-800 flex-auto">{children}</Frame>
				) : null}
			</div>
			<div className="resize-handle cursor-ew-resize z-10 w-2 -ml-2" />
			<div className="resize-handle cursor-ew-resize z-10 w-2 -mr-2" />
			<div className="flex" style={{ width: `calc(100% - ${leftWidth}%)` }}>
				<Frame className={mainFrameStyle}>
					<EditorTabs />
					<div className="-mx-8 px-8 pt-7 border-0 border-t border-t-gray-600">
						<OutputTabs />
					</div>
					<LogoFrame
						className={cn(
							"absolute fill-white opacity-10 pointer-events-none",
							"max-w-72 2xl:max-w-80 3xl:max-w-420 -bottom-10 2xl:bottom-7 right-2 2xl:right-7"
						)}
					/>
				</Frame>
			</div>
		</div>
	);
};

import React, { useState, useEffect } from "react";
import { Minimize, LogoFrame } from "@assets/image";
import { Frame, IconButton, Toast } from "@components/atoms";
import { EditorTabs, OutputTabs } from "@components/organisms";
import { ISplitFrame } from "@interfaces/components";
import { cn } from "@utilities";

export const SplitFrame = ({ children, isFullScreen, setIsFullScreen }: ISplitFrame) => {
	const [isOpenToast, setIsOpenToast] = useState(true);
	const [leftWidth, setLeftWidth] = useState(50);

	const baseStyle = cn("flex justify-end h-full w-2/3", { "w-full": isFullScreen });
	const mainFrameStyle = cn("rounded-l-none pb-0", { "rounded-2xl": !children });

	const handleFullScreenToggle = () => setIsFullScreen(!isFullScreen);
	const handleCloseToast = () => setIsOpenToast(false);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const adjustment = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
			if (!adjustment) return;

			setLeftWidth((prevWidth) => Math.max(20, Math.min(80, prevWidth + adjustment)));
		};

		const startResizing = (downEvent: MouseEvent) => {
			const startX = downEvent.clientX;
			const startWidth = window.innerWidth * (leftWidth / 100);

			const doResize = (moveEvent: MouseEvent) => {
				const currentX = moveEvent.clientX;
				const newWidth = Math.max(300, Math.min(startWidth + (currentX - startX), window.innerWidth - 300));
				setLeftWidth((newWidth / window.innerWidth) * 100);
			};

			const stopResizing = () => {
				document.removeEventListener("mousemove", doResize);
				document.removeEventListener("mouseup", stopResizing);
			};

			document.addEventListener("mousemove", doResize);
			document.addEventListener("mouseup", stopResizing);
		};

		document.addEventListener("keydown", onKeyDown);

		document.addEventListener("mousedown", (event) => {
			const target = event.target as HTMLElement;
			if (!target.classList.contains("resize-handle")) return;
			startResizing(event);
		});

		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [leftWidth]);

	return (
		<div className={baseStyle}>
			<div className="flex" style={{ width: `${leftWidth}%` }}>
				{children ? (
					<Frame className="rounded-r-none border-r border-gray-600 bg-gray-800 flex-auto">
						<IconButton
							className="hover:scale-125 absolute -left-5 top-1/2 -translate-y-1/2 z-50 bg-black"
							onClick={handleFullScreenToggle}
						>
							<Minimize />
						</IconButton>
						{children}
					</Frame>
				) : null}
			</div>
			<div className="resize-handle cursor-ew-resize z-10 w-2 -ml-2" />
			<div className="flex" style={{ width: `calc(100% - ${leftWidth}%)` }}>
				<Frame className={mainFrameStyle}>
					<EditorTabs />
					<div className="-mx-8 px-8 pt-7 border-0 border-t border-t-gray-600">
						<OutputTabs />
					</div>
					<LogoFrame className="absolute bottom-7 right-7 fill-white opacity-10 pointer-events-none" />
				</Frame>
			</div>
			<Toast className="border-error" duration={15} isOpen={isOpenToast} onClose={handleCloseToast}>
				<h5 className="text-error font-semibold">Error Headline</h5>
				<p className="mt-1 text-xs">The state or condition of being wrong conduct.</p>
			</Toast>
		</div>
	);
};

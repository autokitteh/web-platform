import React, { useId } from "react";

import { defaultSystemLogSize } from "@src/constants";
import { useResize, useWindowDimensions } from "@src/hooks";
import { useLoggerStore } from "@src/store";
import { cn } from "@src/utilities";

import { ResizeButton } from "@components/atoms";
import { SystemLog } from "@components/organisms";

export const SystemLogLayout = ({
	children,
	className,
	sidebar,
	topbar,
}: {
	children: React.ReactNode;
	className?: string;
	sidebar?: React.ReactNode;
	topbar?: React.ReactNode;
}) => {
	const layoutClasses = cn("h-screen w-screen flex md:pr-5", className);

	const { setSystemLogHeight, systemLogHeight } = useLoggerStore();

	const { isIOS, isMobile } = useWindowDimensions();

	const resizeId = useId();

	useResize({
		direction: "vertical",
		...defaultSystemLogSize,
		id: resizeId,
		value: systemLogHeight,
		onChange: (newVal) => {
			setSystemLogHeight(newVal);
		},
	});

	const buttonResizeClasses = cn("my-0.5", { "my-0": systemLogHeight === 100 });

	return (
		<div className={layoutClasses}>
			{sidebar}
			<div className="flex-1 md:mb-2">
				<div className="flex flex-col overflow-hidden" style={{ height: `${100 - systemLogHeight}%` }}>
					{topbar}
					{children}
				</div>

				{isIOS || isMobile ? null : (
					<ResizeButton className={buttonResizeClasses} direction="vertical" resizeId={resizeId} />
				)}

				<div className="z-20 overflow-hidden" style={{ height: `${systemLogHeight}%` }}>
					<SystemLog />
				</div>
			</div>
		</div>
	);
};

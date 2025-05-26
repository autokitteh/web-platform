import React, { useEffect, useRef, useState } from "react";

type AutoSizerProps = {
	children: (size: { height: number; width: number }) => React.ReactNode;
	className?: string;
	observeHeight?: boolean;
	observeWidth?: boolean;
};

export const AutoSizer: React.FC<AutoSizerProps> = ({
	children,
	className,
	observeWidth = true,
	observeHeight = true,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const element = containerRef.current;
		if (!element) return;

		const updateSize = () => {
			const { width, height } = element.getBoundingClientRect();
			setSize((prev) => ({
				width: observeWidth ? width : prev.width,
				height: observeHeight ? height : prev.height,
			}));
		};

		updateSize(); // set initial size

		const observer = new ResizeObserver(updateSize);
		observer.observe(element);

		return () => observer.disconnect();
	}, [observeWidth, observeHeight]);

	return (
		<div className={className} ref={containerRef} style={{ height: "100%", width: "100%" }}>
			{children(size)}
		</div>
	);
};

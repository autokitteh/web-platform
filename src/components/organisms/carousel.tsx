import React, { useEffect, useRef, useState } from "react";

import { IntegrationsMap, HiddenIntegrationsForTemplates } from "@src/enums/components/connection.enum";

import { Typography } from "@components/atoms";

export const IntegrationsCarousel: React.FC = () => {
	const carouselRef = useRef<HTMLDivElement>(null);
	const [isHovering, setIsHovering] = useState(false);

	// Combine all integrations into one array
	const allIntegrations = [...Object.values(IntegrationsMap), ...Object.values(HiddenIntegrationsForTemplates)];

	// Duplicate the array to create a seamless loop
	const displayIntegrations = [...allIntegrations, ...allIntegrations];

	useEffect(() => {
		let animationId: number;
		let startTime: number;
		let previousTimestamp: number;

		const scroll = (timestamp: number) => {
			if (!carouselRef.current || isHovering) {
				animationId = requestAnimationFrame(scroll);
				return;
			}

			if (!startTime) startTime = timestamp;
			if (!previousTimestamp) previousTimestamp = timestamp;

			const elapsed = timestamp - previousTimestamp;
			previousTimestamp = timestamp;

			// Adjust speed (lower number = faster)
			const scrollAmount = elapsed * 0.05;
			carouselRef.current.scrollLeft += scrollAmount;

			// Reset scroll position when we've scrolled through half the items
			// to create an infinite loop effect
			if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth / 2) {
				carouselRef.current.scrollLeft = 0;
			}

			animationId = requestAnimationFrame(scroll);
		};

		animationId = requestAnimationFrame(scroll);

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	}, [isHovering]);

	return (
		<div className="relative mb-12 w-full max-w-6xl">
			<Typography className="mb-4 text-xl font-bold text-white" element="h3">
				Seamlessly connect with your favorite tools
			</Typography>

			<div
				className="flex items-center overflow-x-hidden scroll-smooth py-6"
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
				ref={carouselRef}
			>
				{displayIntegrations.map((integration, index) => (
					<div
						className="group mx-4 flex min-w-[90px] flex-col items-center justify-center"
						key={`${integration.value}-${index}`}
					>
						<div
							className="mb-2 flex size-12 items-center justify-center rounded-lg bg-gray-900 p-2 transition-all 
                            duration-300 group-hover:scale-110 group-hover:bg-gray-800"
						>
							{React.createElement(integration.icon, { className: "w-8 h-8" })}
						</div>
						<Typography
							className="whitespace-nowrap text-xs text-gray-400 transition-colors group-hover:text-white"
							element="p"
						>
							{integration.label}
						</Typography>
					</div>
				))}
			</div>

			{/* Pause/play indicator - only show when hovering */}
			{isHovering ? (
				<div
					className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full 
                        bg-gray-900/80 p-2 transition-opacity"
				>
					<div className="flex size-6 items-center justify-center">
						<span className="text-green-800">II</span>
					</div>
				</div>
			) : null}
		</div>
	);
};

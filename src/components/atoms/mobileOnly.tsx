import React, { useEffect, useState } from "react";

interface MobileOnlyProps {
	children: React.ReactNode;
	className?: string;
}

export const MobileOnly: React.FC<MobileOnlyProps> = ({ children, className = "" }) => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkIsMobile();

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === document.body) {
					checkIsMobile();
				}
			}
		});

		resizeObserver.observe(document.body);

		const handleResize = () => {
			checkIsMobile();
		};

		window.addEventListener("resize", handleResize);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	if (!isMobile) {
		return null;
	}

	return <div className={className}>{children}</div>;
};

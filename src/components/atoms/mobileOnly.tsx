import React, { useCallback, useEffect, useState } from "react";

import { useResizeObserver } from "@src/hooks/useResizeObserver";
import { MobileOnlyProps } from "@src/interfaces/components";

export const MobileOnly: React.FC<MobileOnlyProps> = ({ children, className = "" }) => {
	const [isMobile, setIsMobile] = useState(false);

	const checkIsMobile = useCallback(() => {
		setIsMobile(window.innerWidth < 768);
	}, []);

	useResizeObserver({ callback: checkIsMobile });

	useEffect(() => {
		checkIsMobile();

		window.addEventListener("resize", checkIsMobile);

		return () => {
			window.removeEventListener("resize", checkIsMobile);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!isMobile) {
		return null;
	}

	return <div className={className}>{children}</div>;
};

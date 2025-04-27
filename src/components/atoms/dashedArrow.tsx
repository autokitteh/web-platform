import React from "react";

import { cn } from "@utilities";

export const DashedArrow = ({ style, className }: { className: string; style: React.CSSProperties }) => {
	const arrowClass = cn("dashed-arrow", className);
	return <div className={arrowClass} style={style} />;
};

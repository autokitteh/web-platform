import React from "react";

export const DashedArrow = ({ style, className }: { className: string; style: React.CSSProperties }) => {
	return <div className={`dashed-arrow ${className}`} style={style} />;
};

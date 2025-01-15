import React from "react";

export const SuccessMessage = ({ children }: { children: string }) => {
	return <div className="text-green-800">{children}</div>;
};

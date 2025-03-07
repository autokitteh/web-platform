import React from "react";

export const SuccessMessage = ({ children }: { children: string }) => (
	<div className="text-base text-green-800 opacity-100 transition-opacity duration-300 ease-in-out">{children}</div>
);

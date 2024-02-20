import React, { PropsWithChildren } from "react";
import { IconLogoAuth } from "@assets/image";

export const AuthWrapper = ({ children }: PropsWithChildren) => {
	return (
		<div className="w-screen h-screen pt-5 pb-10 pr-9 pl-10 flex flex-col">
			<IconLogoAuth />
			{children}
		</div>
	);
};

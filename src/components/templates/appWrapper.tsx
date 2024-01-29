import React, { ReactNode } from "react";
import { Topbar, Sidebar } from "@components/organisms";

interface IAppWrapper {
	children: ReactNode;
}

export const AppWrapper = ({ children }: IAppWrapper) => {
	return (
		<div className="w-screen h-screen pr-5">
			<div className="flex h-full">
				<Sidebar />
				<div className="flex-1">
					<Topbar name="Slack Monitor" version="Version 454462" />
					{children}
				</div>
			</div>
		</div>
	);
};

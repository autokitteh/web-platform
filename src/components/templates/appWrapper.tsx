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
				<div className="flex-1 flex flex-col">
					<Topbar name="Slack Monitor" version="Version 454462" />
					<div className="py-2.5 flex-1">{children}</div>
				</div>
			</div>
		</div>
	);
};

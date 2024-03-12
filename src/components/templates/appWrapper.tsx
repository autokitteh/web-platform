import React, { PropsWithChildren } from "react";
import { Topbar, Sidebar } from "@components/organisms";

export const AppWrapper = ({ children }: PropsWithChildren) => {
	return (
		<div className="w-screen h-screen pr-5">
			<div className="flex h-full">
				<Sidebar />
				<div className="flex-1 flex flex-col overflow-auto pl-7 -ml-7">
					<Topbar />
					<div className="py-2.5 flex-1">{children}</div>
				</div>
			</div>
		</div>
	);
};

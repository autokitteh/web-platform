import React, { PropsWithChildren } from "react";
import { Sidebar } from "@components/organisms";

export const DashboardWrapper = ({ children }: PropsWithChildren) => {
	return (
		<div className="w-screen h-screen">
			<div className="flex h-full">
				<Sidebar />
				<div className="flex-1 flex flex-col overflow-auto pl-7 -ml-7 transition">
					<div className="flex-1">{children}</div>
				</div>
			</div>
		</div>
	);
};

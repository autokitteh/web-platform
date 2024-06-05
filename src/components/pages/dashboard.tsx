import React from "react";
import { AppWrapper } from "@components/templates";
import { isAuthEnabled } from "@constants";
import { useUserStore } from "@store";

export const Dashboard: React.FC = () => {
	const { user, logoutFunction } = useUserStore();

	const userName = user?.name || "";

	return (
		<AppWrapper>
			<div className="flex w-full">
				<h1 className="text-black w-full text-2xl font-averta-bold mt-6">
					Welcome {userName ? `, ${userName}` : null}
				</h1>
			</div>
			{isAuthEnabled ? (
				<button className="text-black" onClick={() => logoutFunction()}>
					Logout
				</button>
			) : null}
		</AppWrapper>
	);
};

import React from "react";
import { isAuthEnabled } from "@constants";
import { useUserStore } from "@store";

export const Dashboard: React.FC = () => {
	const { user, logoutFunction } = useUserStore();

	const userName = user?.name || "";

	return (
		<div>
			<div className="flex w-full">
				<h1 className="w-full mt-6 text-2xl text-black font-averta-bold">
					Welcome {userName ? `, ${userName}` : null}
				</h1>
			</div>
			{isAuthEnabled ? (
				<button className="text-black" onClick={() => logoutFunction()}>
					Logout
				</button>
			) : null}
		</div>
	);
};

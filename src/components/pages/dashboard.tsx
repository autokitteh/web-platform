import React from "react";

import { isAuthEnabled } from "@constants";

import { useUserStore } from "@store";

export const Dashboard: React.FC = () => {
	const { logoutFunction, user } = useUserStore();

	const userName = user?.name || "";

	return (
		<div>
			<div className="flex w-full">
				<h1 className="font-averta-bold mt-6 w-full text-2xl text-black">
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

import React from "react";
import { Loader } from "@components/atoms";
import { isAuthEnabled } from "@constants";
import { useUserStore } from "@store";

export const Dashboard: React.FC = () => {
	const { user, logoutFunction } = useUserStore();

	const userName = user?.name || "";

	return (
		<div>
			<div className="flex w-full">
				<h1 className="text-black w-full text-2xl font-averta-bold mt-6">
					Welcome {userName ? `, ${userName}` : null}
				</h1>
				<Loader />
			</div>
			{isAuthEnabled ? (
				<button className="text-black" onClick={() => logoutFunction()}>
					Logout
				</button>
			) : null}
		</div>
	);
};

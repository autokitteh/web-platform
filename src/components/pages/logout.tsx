import React from "react";
import { useDescope } from "@descope/react-sdk";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
	const { logout } = useDescope();
	const navigate = useNavigate();

	const logoutClick = () => {
		logout();
		navigate("/");
	};
	return (
		<button className="text-black bg-red" onClick={logoutClick}>
			Test
		</button>
	);
};

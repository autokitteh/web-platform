import React, { useCallback, useEffect } from "react";
import { baseUrl } from "@constants";
import { Descope, useDescope } from "@descope/react-sdk";
import { useProjectStore, useToastStore } from "@store";
import { useUserStore } from "@store/useUserStore";
import axios from "axios";
import { useTranslation } from "react-i18next";

export const DescopeMiddleware = ({ children }: { children: React.ReactNode }) => {
	const { reset: resetProjectStore, getProjectMenutItems } = useProjectStore();
	const { reset: resetUserStore, setLogoutFunction, user, getLoggedInUser } = useUserStore();
	const { logout } = useDescope();
	const handleLogout = useCallback(() => {
		resetProjectStore();
		resetUserStore();
		logout();
	}, [resetProjectStore, resetUserStore, logout]);
	const { t: tErrors } = useTranslation(["errors"]);
	const addToast = useToastStore((state) => state.addToast);

	useEffect(() => {
		setLogoutFunction(handleLogout);
	}, [handleLogout, setLogoutFunction]);

	const handleSuccess = useCallback(
		async (e: CustomEvent<any>) => {
			try {
				await axios.get(`${baseUrl}/auth/descope/login?jwt=${e.detail.sessionJwt}`, { withCredentials: true });
				await getLoggedInUser();
				await getProjectMenutItems();
			} catch (error) {
				addToast({
					id: Date.now().toString(),
					message: `Error occurred during login: ${(error as Error).message}`,
					type: "error",
					title: tErrors("error"),
				});
			}
		},
		[getLoggedInUser, getProjectMenutItems]
	);

	if (!user) {
		return <Descope flowId="sign-up-or-in" onSuccess={handleSuccess} />;
	}

	return children;
};

import React, { useCallback, useEffect, useState } from "react";
import { Toast } from "@components/atoms";
import { baseUrl } from "@constants";
import { Descope, useDescope } from "@descope/react-sdk";
import { useProjectStore } from "@store";
import { useUserStore } from "@store/useUserStore";
import axios from "axios";
import { t } from "i18next";

export const DescopeMiddleware = ({ children }: { children: React.ReactNode }) => {
	const { reset: resetProjectStore, getProjectMenutItems } = useProjectStore();
	const { reset: resetUserStore, setLogoutFunction, user, getLoggedInUser } = useUserStore();
	const { logout } = useDescope();

	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const handleLogout = useCallback(() => {
		resetProjectStore();
		resetUserStore();
		logout();
	}, [resetProjectStore, resetUserStore, logout]);

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
				setToast({ isOpen: true, message: `Error occurred during login: ${(error as Error).message}` });
			}
		},
		[getLoggedInUser, getProjectMenutItems]
	);

	if (!user) {
		return (
			<>
				<Descope flowId="sign-up-or-in" onSuccess={handleSuccess} />
				<Toast
					duration={5}
					isOpen={toast.isOpen}
					onClose={() => setToast({ ...toast, isOpen: false })}
					title={t("error", { ns: "errors" })}
					type="error"
				>
					<p className="mt-1 text-xs">{toast.message}</p>
				</Toast>
			</>
		);
	}

	return children;
};

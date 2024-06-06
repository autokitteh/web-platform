import React, { useCallback, useEffect, useState } from "react";
import { Toast } from "@components/atoms";
import { baseUrl } from "@constants";
import { Descope, useDescope, useSession } from "@descope/react-sdk";
import { useProjectStore } from "@store";
import { useUserStore } from "@store/useUserStore";
import axios from "axios";
import { t } from "i18next";

export const DescopeMiddleware = ({ children }: { children: React.ReactNode }) => {
	const { reset: resetProjectStore } = useProjectStore();
	const { reset: resetUserStore, setLogoutFunction } = useUserStore();
	const { logout } = useDescope();
	const { isAuthenticated } = useSession();

	useEffect(() => {
		const handleLogout = () => {
			resetProjectStore();
			resetUserStore();
			logout();
		};

		setLogoutFunction(handleLogout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resetProjectStore, resetUserStore, logout]);

	const { getProjectsList } = useProjectStore();
	const { user, getLoggedInUser } = useUserStore();

	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const [isAuthChecked, setIsAuthChecked] = useState(false);

	const handleSuccess = useCallback(
		async (e: CustomEvent<any>) => {
			try {
				await axios.get(`${baseUrl}/auth/descope/login?jwt=${e.detail.sessionJwt}`, { withCredentials: true });
				await getLoggedInUser();
				await getProjectsList();
			} catch (error) {
				setToast({ isOpen: true, message: `Error occured during login: ${(error as Error).message}` });
			}
		},
		[getLoggedInUser, getProjectsList]
	);

	useEffect(() => {
		if (user) {
			getProjectsList();
			setIsAuthChecked(true);
		} else if (!isAuthenticated) {
			setIsAuthChecked(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, isAuthenticated]);

	if (!isAuthChecked) {
		return <h1 className="text-black w-full text-center text-2xl font-averta-bold mt-6">Loading...</h1>;
	}

	return (
		<div>
			{user ? children : <Descope flowId="sign-up-or-in" onSuccess={handleSuccess} />}
			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={t("error", { ns: "errors" })}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};

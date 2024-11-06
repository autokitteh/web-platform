import React, { ReactNode, Suspense, lazy, useCallback, useEffect, useState } from "react";

import { useDescope } from "@descope/react-sdk";
import axios from "axios";
import Cookies from "js-cookie";
import psl from "psl";
import { useTranslation } from "react-i18next";

import { authBearer, isLoggedInCookie, namespaces } from "@constants";
import { LoggerService } from "@services/index";
import { getApiBaseUrl, getCookieDomain } from "@src/utilities";
import { useUserStore } from "@store/useUserStore";

import { useToastStore } from "@store";

import { Loader } from "@components/atoms";

const LoginPage = lazy(() => import("../pages/login"));

export const DescopeMiddleware = ({ children }: { children: ReactNode }) => {
	const { getLoggedInUser, setLogoutFunction } = useUserStore();
	const { logout } = useDescope();
	const { t } = useTranslation("login");
	const addToast = useToastStore((state) => state.addToast);
	const [isLoggingIn, setIsLoggingIn] = useState(false);

	const handleLogout = useCallback(async () => {
		await logout();
		const rootDomain = psl.parse(window.location.hostname);
		if (rootDomain.error) {
			addToast({
				message: t("errors.logoutFailed", { error: rootDomain.error.message }),
				type: "error",
			});
			LoggerService.error(namespaces.ui.loginPage, t("errors.logoutFailed", { error: rootDomain.error.message }));

			return;
		}
		Cookies.remove(isLoggedInCookie, { domain: getCookieDomain(rootDomain) });
		window.localStorage.clear();
		window.location.reload();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [logout]);

	const [descopeRenderKey, setDescopeRenderKey] = useState(0);

	useEffect(() => {
		setLogoutFunction(handleLogout);
	}, [handleLogout, setLogoutFunction]);

	const handleSuccess = useCallback(
		async (event: CustomEvent<any>) => {
			setIsLoggingIn(true);
			try {
				const apiBaseUrl = getApiBaseUrl();
				await axios.get(`${apiBaseUrl}/auth/descope/login?jwt=${event.detail.sessionJwt}`, {
					withCredentials: true,
				});
				const error = await getLoggedInUser();
				if (error) {
					addToast({
						message: t("errors.loginFailedExtended", { error }),
						type: "error",
					});
					LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailedExtended", { error }), true);
				}
			} catch (error) {
				if (axios.isAxiosError(error)) {
					addToast({
						message: t("errors.loginFailed"),
						type: "error",
					});
					LoggerService.error(
						namespaces.hooks.connectionForm,
						t("errors.loginFailedExtended", { error: error?.response?.data }),
						true
					);

					return;
				}
				addToast({
					message: t("errors.loginFailed"),
					type: "error",
				});
				LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailedExtended", { error }), true);
			} finally {
				setIsLoggingIn(false);
				setDescopeRenderKey((prevKey) => prevKey + 1);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[getLoggedInUser]
	);

	const isLoggedIn = Cookies.get(isLoggedInCookie);

	if (authBearer || isLoggedIn) {
		return children;
	}

	return (
		<Suspense fallback={<Loader isCenter />}>
			<LoginPage descopeRenderKey={descopeRenderKey} handleSuccess={handleSuccess} isLoggingIn={isLoggingIn} />
		</Suspense>
	);
};

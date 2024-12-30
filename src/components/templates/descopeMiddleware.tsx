import React, { ReactNode, Suspense, lazy, useCallback, useEffect, useState } from "react";

import { useDescope } from "@descope/react-sdk";
import Cookies from "js-cookie";
import psl from "psl";
import { useTranslation } from "react-i18next";
import { matchRoutes, useLocation, useNavigate } from "react-router-dom";

import { isLoggedInCookie, jwtAuthBearerToken, namespaces, playwrightTestsAuthBearer } from "@constants";
import { LoggerService } from "@services/index";
import { getApiBaseUrl, getCookieDomain } from "@src/utilities";
import { useUserStore } from "@store/useUserStore";

import { useLoggerStore, useToastStore } from "@store";

import { Loader } from "@components/atoms";
import { External404 } from "@components/pages";

const LoginPage = lazy(() => import("../pages/login"));

const routes = [
	{ path: "/" },
	{ path: "/404" },
	{ path: "/intro" },
	{ path: "/projects/*" },
	{ path: "/settings/*" },
	{ path: "/events/*" },
];

export const DescopeMiddleware = ({ children }: { children: ReactNode }) => {
	const { getLoggedInUser, setLogoutFunction } = useUserStore();
	const { logout } = useDescope();
	const { t } = useTranslation("login");
	const addToast = useToastStore((state) => state.addToast);
	const clearLogs = useLoggerStore((state) => state.clearLogs);
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

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
				await fetch(`${apiBaseUrl}/auth/descope/login?jwt=${event.detail.sessionJwt}`, {
					credentials: "include",
					method: "GET",
					redirect: "manual",
				});

				const error = await getLoggedInUser();
				if (error) {
					addToast({
						message: t("errors.loginFailed"),
						type: "error",
					});
					LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailedExtended", { error }), true);

					return;
				}
				clearLogs();

				const hsPortalId = import.meta.env.HUBSPOT_PORTAL_ID;
				const hsFormId = import.meta.env.HUBSPOT_FORM_ID;
				const hsutk = Cookies.get("hubspotutk") || "";

				if (!hsPortalId || !hsFormId) return;
				const response = await fetch(
					`https://api.hsforms.com/submissions/v3/integration/submit/${hsPortalId}/${hsFormId}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							formId: hsFormId,

							fields: [
								{
									objectTypeId: "0-1",
									name: "email",
									value: "boristwist1@gmail.com",
								},
								{
									objectTypeId: "0-1",
									name: "firstname",
									value: "Ronen Test",
								},
							],
							context: {
								hutk: hsutk,
								pageUri: window.location.href,
								pageName: "WebUI Login",
							},
						}),
					}
				);

				if (!response.ok) {
					throw new Error("Failed to submit form data");
				}
			} catch (error) {
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

	if (playwrightTestsAuthBearer || jwtAuthBearerToken || isLoggedIn) {
		return children;
	}

	if (location.pathname === "/404") {
		return <External404 />;
	}

	const matches = matchRoutes(routes, location);

	if (!matches) {
		navigate("/404");

		return;
	}

	return (
		<Suspense fallback={<Loader isCenter />}>
			<LoginPage descopeRenderKey={descopeRenderKey} handleSuccess={handleSuccess} isLoggingIn={isLoggingIn} />
		</Suspense>
	);
};

import React, { ReactNode, Suspense, lazy, useCallback, useEffect, useState, useRef } from "react";

import { useDescope } from "@descope/react-sdk";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { matchRoutes, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { googleTagManagerEvents, isLoggedInCookie, namespaces, playwrightTestsAuthBearer } from "@constants";
import { LoggerService } from "@services";
import { LocalStorageKeys } from "@src/enums";
import { useHubspot, useLoginAttempt, useHubspotSubmission } from "@src/hooks";
import { descopeJwtLogin, logoutBackend } from "@src/services/auth.service";
import { gTagEvent, getApiBaseUrl, setLocalStorageValue } from "@src/utilities";
import { clearAuthCookies } from "@src/utilities/auth";

import { useLoggerStore, useOrganizationStore, useToastStore } from "@store";

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
	{ path: "/template/*" },
];

export const DescopeMiddleware = ({ children }: { children: ReactNode }) => {
	const { login, setLogoutFunction, user, refreshCookie } = useOrganizationStore();
	const { t } = useTranslation("login");
	const { attemptLogin, isLoggingIn } = useLoginAttempt({ login, t });
	const submitHubspot = useHubspotSubmission({ t });

	const { logout } = useDescope();
	const addToast = useToastStore((state) => state.addToast);
	const clearLogs = useLoggerStore((state) => state.clearLogs);

	const location = useLocation();
	const navigate = useNavigate();
	const [apiToken, setApiToken] = useState<string>();
	const [searchParams, setSearchParams] = useSearchParams();
	const logoutFunctionSet = useRef(false);

	const [descopeRenderKey, setDescopeRenderKey] = useState(0);

	const { revokeCookieConsent, setIdentity, setPathPageView } = useHubspot();

	useEffect(() => {
		if (location.pathname.startsWith("/template") && searchParams.has("name")) {
			const nameValue = searchParams.get("name");
			if (nameValue && Cookies.get("landing-template-name") !== nameValue) {
				Cookies.set("landing-template-name", nameValue, { path: "/" });
			}
		}
	}, [location.pathname, searchParams]);

	useEffect(() => {
		refreshCookie();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setPathPageView(location.pathname);
	}, [location.pathname, setPathPageView]);

	// Login with apiToken from URL (one time on mount)
	useEffect(() => {
		const queryParams = new URLSearchParams(window.location.search);
		const apiTokenFromURL = queryParams.get("apiToken");
		const nameParam = queryParams.get("name");

		if (!apiTokenFromURL || user || isLoggingIn) return;
		setLocalStorageValue(LocalStorageKeys.apiToken, apiTokenFromURL);
		setApiToken(apiTokenFromURL);

		const paramsToKeep: Record<string, string> = {};
		if (nameParam) paramsToKeep.name = nameParam;
		setSearchParams(paramsToKeep, { replace: true });

		attemptLogin();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (playwrightTestsAuthBearer && !isLoggingIn && !user) {
			attemptLogin();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSuccess = useCallback(
		async (event: CustomEvent<any>) => {
			try {
				const token = event.detail.sessionJwt;
				const apiBaseUrl = getApiBaseUrl();
				await descopeJwtLogin(token, apiBaseUrl);
				await new Promise((resolve) => setTimeout(resolve, 500));
				if (Cookies.get(isLoggedInCookie)) {
					const { data: user, error } = await login();
					if (error) {
						addToast({ message: t("errors.loginFailedTryAgainLater"), type: "error" });
						clearAuthCookies();
						return;
					}
					clearLogs();
					gTagEvent(googleTagManagerEvents.login, { method: "descope", ...user });
					setIdentity(user!.email);
					await submitHubspot(user!);
					setDescopeRenderKey((prevKey) => prevKey + 1);
					return;
				}
				LoggerService.error(namespaces.ui.loginPage, "Failed to authenticate properly with the server");
				addToast({ message: t("errors.loginFailedTryAgainLater"), type: "error" });
				clearAuthCookies();
			} catch (error) {
				addToast({
					message: t("errors.loginFailedTryAgainLater"),
					type: "error",
					hideSystemLogLinkOnError: true,
				});
				LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailedExtended", { error }), true);
				clearAuthCookies();
			}
		},
		[login, t, addToast, clearLogs, setIdentity, submitHubspot]
	);

	const handleLogout = useCallback(
		async (redirectToLogin: boolean = false) => {
			logout();
			clearAuthCookies();
			try {
				await logoutBackend(getApiBaseUrl());
			} catch (error) {
				LoggerService.warn(namespaces.ui.loginPage, `Logout endpoint error: ${error}`, true);
			}
			revokeCookieConsent();
			window.localStorage.clear();
			if (redirectToLogin) window.location.href = "/";
			else window.location.reload();
		},
		[logout, revokeCookieConsent]
	);

	useEffect(() => {
		if (!logoutFunctionSet.current) {
			setLogoutFunction(handleLogout);
			logoutFunctionSet.current = true;
		}
	}, [handleLogout, setLogoutFunction]);

	const isLoggedIn = user && Cookies.get(isLoggedInCookie);
	if ((playwrightTestsAuthBearer || apiToken || isLoggedIn) && !isLoggingIn) {
		return children;
	}

	if (location.pathname === "/404") {
		return <External404 />;
	}

	const matches = matchRoutes(routes, location);
	if (!matches) {
		navigate("/404");
		return null;
	}

	return (
		<Suspense fallback={<Loader isCenter />}>
			<LoginPage descopeRenderKey={descopeRenderKey} handleSuccess={handleSuccess} isLoggingIn={isLoggingIn} />
		</Suspense>
	);
};

import React, { ReactNode, Suspense, lazy, useCallback, useEffect, useState, useRef } from "react";

import { useDescope } from "@descope/react-sdk";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { matchRoutes, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { googleTagManagerEvents, systemCookies, namespaces, playwrightTestsAuthBearer } from "@constants";
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
	{ path: "/ai" },
	{ path: "/welcome" },
	{ path: "/templates-library" },
	{ path: "/chat" },
	{ path: "/template/*" },
	{ path: "/projects/*" },
	{ path: "/settings/*" },
	{ path: "/organization-settings/*" },
	{ path: "/events/*" },
	{ path: "/switch-organization/*" },
	{ path: "/error" },
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

	const { revokeCookieConsent, setIdentity, setPathPageView } = useHubspot();

	useEffect(() => {
		if (location.pathname.startsWith("/template") && searchParams.has("name")) {
			const nameValue = searchParams.get("name");
			if (nameValue && Cookies.get(systemCookies.templatesLandingName) !== nameValue) {
				Cookies.set(systemCookies.templatesLandingName, nameValue, { path: "/" });
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

	useEffect(() => {
		const handleApiToken = async () => {
			const apiTokenFromURL = searchParams.get("apiToken");
			const nameParam = searchParams.get("name");
			const startParam = searchParams.get("start");

			if (startParam) {
				Cookies.set(systemCookies.chatStartMessage, startParam, { path: "/" });
			}

			if (apiTokenFromURL && !user && !isLoggingIn) {
				await setLocalStorageValue(LocalStorageKeys.apiToken, apiTokenFromURL);
				setApiToken(apiTokenFromURL);

				const paramsToKeep: Record<string, string> = {};
				if (nameParam) paramsToKeep.name = nameParam;
				if (startParam) paramsToKeep.start = startParam;
				setSearchParams(paramsToKeep, { replace: true });

				attemptLogin();
			}
		};

		handleApiToken();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams, user, isLoggingIn]);

	useEffect(() => {
		if (playwrightTestsAuthBearer && !isLoggingIn && !user) {
			attemptLogin();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const resetDescopeComponent = async (clearCookies: boolean = true) => {
		if (clearCookies) {
			await clearAuthCookies();
		}
	};

	const handleSuccess = async (token: string) => {
		try {
			const apiBaseUrl = getApiBaseUrl();
			try {
				await descopeJwtLogin(token, apiBaseUrl);
			} catch (error) {
				LoggerService.warn(namespaces.ui.loginPage, t("errors.redirectError", { error }), true);
			}
			if (Cookies.get(systemCookies.isLoggedIn)) {
				const { data: user, error } = await login();
				if (error) {
					addToast({
						message: t("errors.loginFailedTryAgainLater"),
						type: "error",
						hideSystemLogLinkOnError: true,
					});
					await resetDescopeComponent();
					return;
				}
				clearLogs();
				gTagEvent(googleTagManagerEvents.login, { method: "descope", ...user });
				setIdentity(user!.email);
				await submitHubspot(user!);
				await resetDescopeComponent(false);
				const chatStartMessage = Cookies.get(systemCookies.chatStartMessage);
				if (chatStartMessage) {
					Cookies.remove(systemCookies.chatStartMessage, { path: "/" });

					setTimeout(() => {
						navigate("/chat", {
							state: {
								chatStartMessage,
							},
						});
					}, 0);
				}
				return;
			}
			LoggerService.error(namespaces.ui.loginPage, t("errors.noAuthCookies"), true);
			addToast({
				message: t("errors.loginFailedTryAgainLater"),
				type: "error",
				hideSystemLogLinkOnError: true,
			});
			await resetDescopeComponent();
		} catch (error) {
			addToast({
				message: t("errors.loginFailedTryAgainLater"),
				type: "error",
				hideSystemLogLinkOnError: true,
			});
			LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailedExtended", { error }), true);
			await resetDescopeComponent();
		}
	};

	const handleLogout = useCallback(
		async (redirectToLogin: boolean = false) => {
			logout();
			await clearAuthCookies();
			try {
				await logoutBackend(getApiBaseUrl());
			} catch (error) {
				LoggerService.warn(namespaces.ui.loginPage, t("errors.logoutError", { error }), true);
			}
			revokeCookieConsent();
			window.localStorage.clear();
			if (redirectToLogin) window.location.href = "/";
			else window.location.reload();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[logout, revokeCookieConsent]
	);

	useEffect(() => {
		if (!logoutFunctionSet.current) {
			setLogoutFunction(handleLogout);
			logoutFunctionSet.current = true;
		}
	}, [handleLogout, setLogoutFunction]);

	const matches = matchRoutes(routes, location);

	useEffect(() => {
		if (!matches) {
			LoggerService.debug(namespaces.ui.loginPage, `No match found for location: ${location.pathname}`);
			navigate("/404");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [matches, navigate]);

	const isLoggedIn = user && Cookies.get(systemCookies.isLoggedIn);
	if ((playwrightTestsAuthBearer || apiToken || isLoggedIn) && !isLoggingIn) {
		return children;
	}

	if (location.pathname === "/404") {
		return <External404 />;
	}

	if (!matches) {
		return null;
	}

	return (
		<Suspense fallback={<Loader isCenter />}>
			<LoginPage handleSuccess={handleSuccess} isLoggingIn={isLoggingIn} />
		</Suspense>
	);
};

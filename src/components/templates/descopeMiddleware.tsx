import React, { ReactNode, Suspense, lazy, useCallback, useEffect, useState, useRef } from "react";

import { useDescope } from "@descope/react-sdk";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { matchRoutes, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { googleTagManagerEvents, systemCookies, namespaces, playwrightTestsAuthBearer } from "@constants";
import { LoggerService } from "@services";
import { LocalStorageKeys } from "@src/enums";
import { useHubspot, useLoginAttempt } from "@src/hooks";
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
	{ path: "/chat" },
	{ path: "/welcome" },
	{ path: "/ai" },
];

export const DescopeMiddleware = ({ children }: { children: ReactNode }) => {
	const { login, setLogoutFunction, setTrackUserLoginFunction, user, refreshCookie } = useOrganizationStore();
	const { t } = useTranslation("login");
	const { attemptLogin, isLoggingIn } = useLoginAttempt({ login, t });

	const { logout } = useDescope();
	const addToast = useToastStore((state) => state.addToast);
	const clearLogs = useLoggerStore((state) => state.clearLogs);

	const location = useLocation();
	const navigate = useNavigate();
	const [apiToken, setApiToken] = useState<string>();
	const [searchParams, setSearchParams] = useSearchParams();
	const logoutFunctionSet = useRef(false);
	const trackUserLoginFunctionSet = useRef(false);
	const justLoggedIn = useRef(false);

	const [descopeRenderKey, setDescopeRenderKey] = useState(0);

	const { revokeCookieConsent, trackUserLogin } = useHubspot();

	useEffect(() => {
		if (user && !justLoggedIn.current) {
			refreshCookie();
		}
		if (justLoggedIn.current) {
			const timer = setTimeout(() => {
				justLoggedIn.current = false;
			}, 1000);
			return () => clearTimeout(timer);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	useEffect(() => {
		const queryParams = new URLSearchParams(window.location.search);
		const apiTokenFromURL = queryParams.get("apiToken");
		const nameParam = queryParams.get("name");
		const startParam = queryParams.get("start");
		const e2eParam = queryParams.get("e2e");
		const templateNameFromParams = searchParams.get("template-name");
		const templateNameFromParamsOldFormat =
			searchParams.get("name") && location.pathname.startsWith("/template")
				? searchParams.get("name")
				: undefined;

		const templateNameFromCookies = Cookies.get(systemCookies.templatesLandingName);

		const templateName = (
			(templateNameFromParams as string) ||
			(templateNameFromParamsOldFormat as string) ||
			""
		).trim();

		if (e2eParam) {
			sessionStorage.setItem("e2e", "true");
		}

		if (startParam) {
			Cookies.set(systemCookies.chatStartMessage, startParam, { path: "/" });
		}
		if (templateName && !templateNameFromCookies && templateName !== templateNameFromCookies) {
			Cookies.set(systemCookies.templatesLandingName, templateName, {
				path: "/",
			});
		}

		if (apiTokenFromURL && !user && !isLoggingIn) {
			setLocalStorageValue(LocalStorageKeys.apiToken, apiTokenFromURL);
			setApiToken(apiTokenFromURL);

			const paramsToKeep: Record<string, string> = {};
			if (nameParam) paramsToKeep.name = nameParam;
			if (startParam) paramsToKeep.start = startParam;
			setSearchParams(paramsToKeep, { replace: true });

			justLoggedIn.current = true;
			attemptLogin();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (playwrightTestsAuthBearer && !isLoggingIn && !user) {
			justLoggedIn.current = true;
			attemptLogin();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const resetDescopeComponent = (clearCookies: boolean = true) => {
		if (clearCookies) {
			clearAuthCookies();
		}
		setDescopeRenderKey((prevKey) => prevKey + 1);
	};

	const handleSuccess = useCallback(
		async (event: CustomEvent<any>) => {
			try {
				const token = event.detail.sessionJwt;
				const apiBaseUrl = getApiBaseUrl();

				try {
					await descopeJwtLogin(token, apiBaseUrl);
				} catch (error) {
					LoggerService.warn(namespaces.ui.loginPage, t("errors.redirectError", { error }), true);
				}

				const isLoggedInCookie = Cookies.get(systemCookies.isLoggedIn);
				if (isLoggedInCookie) {
					justLoggedIn.current = true;

					const { data: user, error } = await login();

					if (error) {
						LoggerService.error(namespaces.ui.loginPage, `handleSuccess: login() returned error: ${error}`);
						addToast({ message: t("errors.loginFailedTryAgainLater"), type: "error" });
						resetDescopeComponent();
						justLoggedIn.current = false;
						return;
					}

					clearLogs();

					gTagEvent(googleTagManagerEvents.login, { method: "descope", ...user });

					const redirPath = Cookies.get(systemCookies.redir);
					LoggerService.info(namespaces.ui.loginPage, `[CLI-LOGIN] redir cookie value: ${redirPath}`);
					LoggerService.info(
						namespaces.ui.loginPage,
						`[CLI-LOGIN] systemCookies.redir: ${systemCookies.redir}`
					);
					if (redirPath) {
						LoggerService.info(namespaces.ui.loginPage, "[CLI-LOGIN] redir cookie found, removing it");
						Cookies.remove(systemCookies.redir, { path: "/", domain: ".autokitteh.cloud" });

						if (redirPath.startsWith("/auth/")) {
							const apiBaseUrl = getApiBaseUrl();
							const backendUrl = `${apiBaseUrl}${redirPath}`;
							LoggerService.info(
								namespaces.ui.loginPage,
								`[CLI-LOGIN] Redirecting to backend: ${backendUrl}`
							);

							window.location.href = backendUrl;
							return;
						} else {
							LoggerService.info(
								namespaces.ui.loginPage,
								"[CLI-LOGIN] redir path does not start with /auth/, skipping redirect"
							);
						}
					} else {
						LoggerService.info(namespaces.ui.loginPage, "[CLI-LOGIN] No redir cookie found");
					}

					const templateNameFromCookies = Cookies.get(systemCookies.templatesLandingName);
					if (templateNameFromCookies && location.pathname !== "/template") {
						navigate(`/template?template-name=${templateNameFromCookies}`);
					}

					resetDescopeComponent(false);

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
				addToast({ message: t("errors.loginFailedTryAgainLater"), type: "error" });
				resetDescopeComponent();
			} catch (error) {
				LoggerService.error(
					namespaces.ui.loginPage,
					`handleSuccess: Caught error in outer try-catch: ${error}`,
					true
				);
				addToast({
					message: t("errors.loginFailedTryAgainLater"),
					type: "error",
					hideSystemLogLinkOnError: true,
				});
				LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailedExtended", { error }), true);
				resetDescopeComponent();
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[searchParams]
	);

	const handleLogout = useCallback(
		async (redirectToLogin: boolean = false) => {
			logout();
			clearAuthCookies();
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

	useEffect(() => {
		if (!trackUserLoginFunctionSet.current) {
			setTrackUserLoginFunction(trackUserLogin);
			trackUserLoginFunctionSet.current = true;
		}
	}, [trackUserLogin, setTrackUserLoginFunction]);

	const isLoggedIn = user && Cookies.get(systemCookies.isLoggedIn);
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

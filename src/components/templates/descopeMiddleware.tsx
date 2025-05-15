import React, { ReactNode, Suspense, lazy, useCallback, useEffect, useState, useRef } from "react";

import { useDescope } from "@descope/react-sdk";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { matchRoutes, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import {
	googleTagManagerEvents,
	hubSpotFormId,
	hubSpotPortalId,
	isLoggedInCookie,
	isProduction,
	namespaces,
	playwrightTestsAuthBearer,
} from "@constants";
import { LoggerService } from "@services";
import { LocalStorageKeys } from "@src/enums";
import { useHubspot } from "@src/hooks";
import { gTagEvent, getApiBaseUrl, setLocalStorageValue } from "@src/utilities";

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

	const { logout } = useDescope();
	const { t } = useTranslation("login");
	const addToast = useToastStore((state) => state.addToast);
	const clearLogs = useLoggerStore((state) => state.clearLogs);
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const [apiToken, setApiToken] = useState<string>();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_searchParams, setSearchParams] = useSearchParams();

	const logoutFunctionSet = useRef(false);

	useEffect(() => {
		refreshCookie();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const queryParams = new URLSearchParams(window.location.search);
		const apiTokenFromURL = queryParams.get("apiToken");
		const nameParam = queryParams.get("name");

		if (!apiTokenFromURL || user || isLoggingIn) return;
		setLocalStorageValue(LocalStorageKeys.apiToken, apiTokenFromURL);
		setApiToken(apiTokenFromURL);
		setSearchParams(nameParam ? { name: nameParam } : {}, { replace: true });

		const processToken = async () => {
			setIsLoggingIn(true);
			try {
				const { error } = await login();

				if (error) {
					throw new Error((error as Error).message);
				}

				clearLogs();
			} catch (error) {
				LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailedExtended", { error }), true);

				addToast({
					message: t("errors.loginFailedTryAgainLater"),
					type: "error",
				});
			} finally {
				setIsLoggingIn(false);
			}
		};

		processToken();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (playwrightTestsAuthBearer && !isLoggingIn && !user) {
			const autoLoginWithTestToken = async () => {
				setIsLoggingIn(true);
				try {
					LoggerService.info(namespaces.ui.loginPage, "Attempting login with Playwright test token");
					const { data: userData, error } = await login();

					if (error || !userData) {
						addToast({
							message: t("errors.loginFailedTryAgainLater"),
							type: "error",
						});
					}

					clearLogs();
				} catch (error) {
					LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailedExtended", { error }), true);
				} finally {
					setIsLoggingIn(false);
				}
			};

			autoLoginWithTestToken();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { revokeCookieConsent, setIdentity, setPathPageView } = useHubspot();

	useEffect(() => {
		setPathPageView(location.pathname);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location]);

	const handleLogout = useCallback(
		async (redirectToLogin: boolean = false) => {
			logout();

			setLocalStorageValue(LocalStorageKeys.apiToken, "");
			Cookies.remove(isLoggedInCookie, { path: "/" });

			try {
				const apiBaseUrl = getApiBaseUrl();
				await fetch(`${apiBaseUrl}/logout`, {
					credentials: "include",
					method: "GET",
				});
			} catch (error) {
				LoggerService.warn(namespaces.ui.loginPage, `Logout endpoint error: ${error}`, true);
			}

			revokeCookieConsent();
			window.localStorage.clear();

			if (redirectToLogin) {
				window.location.href = "/";
				return;
			}
			window.location.reload();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[logout]
	);

	const [descopeRenderKey, setDescopeRenderKey] = useState(0);

	useEffect(() => {
		if (!logoutFunctionSet.current) {
			setLogoutFunction(handleLogout);
			logoutFunctionSet.current = true;
		}
	}, [handleLogout, setLogoutFunction]);

	const handleSuccess = useCallback(
		async (event: CustomEvent<any>) => {
			setIsLoggingIn(true);
			try {
				const token = event.detail.sessionJwt;

				const apiBaseUrl = getApiBaseUrl();

				try {
					await fetch(`${apiBaseUrl}/auth/descope/login?jwt=${token}`, {
						credentials: "include",
						method: "GET",
					});
				} catch (error) {
					LoggerService.error(namespaces.ui.loginPage, `Auth endpoint error: ${error}`);
				}
				setSearchParams(
					(prevParams) => {
						const newParams = new URLSearchParams(prevParams);
						const nameParam = newParams.get("name");
						newParams.delete("jwt");
						if (nameParam) {
							const params = new URLSearchParams();
							params.set("name", nameParam);
							return params;
						}
						return new URLSearchParams();
					},
					{ replace: true }
				);
				await new Promise((resolve) => setTimeout(resolve, 500));

				if (Cookies.get(isLoggedInCookie)) {
					const { data: user, error } = await login();

					if (error) {
						addToast({
							message: t("errors.loginFailedTryAgainLater"),
							type: "error",
						});

						setLocalStorageValue(LocalStorageKeys.apiToken, "");
						Cookies.remove(isLoggedInCookie, { path: "/" });
						setIsLoggingIn(false);
						return;
					}

					clearLogs();
					gTagEvent(googleTagManagerEvents.login, { method: "descope", ...user });
					setIdentity(user!.email);
					if (isProduction && hubSpotPortalId && hubSpotFormId) {
						const hsUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${hubSpotPortalId}/${hubSpotFormId}`;

						const hsContext = {
							hutk: Cookies.get("hubspotutk"),
							pageUri: window.location.href,
							pageName: document.title,
						};

						const hsData = [
							{
								objectTypeId: "0-1",
								name: "email",
								value: user?.email,
							},
							{
								objectTypeId: "0-1",
								name: "firstname",
								value: user?.name,
							},
						];

						const submissionData = {
							submittedAt: Date.now(),
							fields: hsData,
							context: hsContext,
						};

						await fetch(hsUrl, {
							method: "POST",
							mode: "cors",
							cache: "no-cache",
							credentials: "same-origin",
							headers: {
								"Content-Type": "application/json",
							},
							redirect: "follow",
							referrerPolicy: "no-referrer",
							body: JSON.stringify(submissionData),
						});
					}

					setIsLoggingIn(false);
					setDescopeRenderKey((prevKey) => prevKey + 1);
					return;
				}

				LoggerService.error(namespaces.ui.loginPage, "Failed to authenticate properly with the server");

				addToast({
					message: t("errors.loginFailedTryAgainLater"),
					type: "error",
				});

				setLocalStorageValue(LocalStorageKeys.apiToken, "");
				Cookies.remove(isLoggedInCookie, { path: "/" });
			} catch (error) {
				addToast({
					message: t("errors.loginFailedTryAgainLater"),
					type: "error",
					hideSystemLogLinkOnError: true,
				});

				LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailedExtended", { error }), true);

				setLocalStorageValue(LocalStorageKeys.apiToken, "");
				Cookies.remove(isLoggedInCookie, { path: "/" });
			}

			setIsLoggingIn(false);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[login]
	);

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

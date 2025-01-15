import React, { ReactNode, Suspense, lazy, useCallback, useEffect, useState } from "react";

import { useDescope } from "@descope/react-sdk";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { matchRoutes, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { googleTagManagerEvents, isLoggedInCookie, namespaces, playwrightTestsAuthBearer } from "@constants";
import { LoggerService, OrganizationsService } from "@services";
import { LocalStorageKeys } from "@src/enums";
import { useHubspot } from "@src/hooks";
import { gTagEvent, getApiBaseUrl, getCookieDomain, setLocalStorageValue } from "@src/utilities";
import { useUserStore } from "@store/useUserStore";

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
];

export const DescopeMiddleware = ({ children }: { children: ReactNode }) => {
	const { getLoggedInUser, setLogoutFunction, user } = useUserStore();
	const { setCurrentOrganization } = useOrganizationStore();

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

	useEffect(() => {
		const queryParams = new URLSearchParams(window.location.search);
		const apiTokenFromURL = queryParams.get("apiToken");

		if (!apiTokenFromURL) return;

		setLocalStorageValue(LocalStorageKeys.apiToken, apiTokenFromURL);
		setApiToken(apiTokenFromURL);
		setSearchParams({});
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
			const { cookieDomain, error } = getCookieDomain(
				window.location.hostname,
				namespaces.authorizationFlow.logout
			);
			if (error) {
				addToast({
					message: t("errors.logoutFailedExtended", { error }),
					type: "error",
				});

				return;
			}

			if (!cookieDomain || cookieDomain === ".") {
				addToast({
					message: t("errors.logoutFailed"),
					type: "error",
				});

				return;
			}

<<<<<<< HEAD
			revokeCookieConsent();
			Cookies.remove(isLoggedInCookie, { domain: cookieDomain });
			setLocalStorageValue(LocalStorageKeys.apiToken, "");
			window.localStorage.clear();
			if (redirectToLogin) {
				window.location.href = "/";
			}
		},
=======
		revokeCookieConsent();
		Cookies.remove(isLoggedInCookie, { domain: cookieDomain });
		window.localStorage.clear();
		setLocalStorageValue(LocalStorageKeys.apiToken, "");
		window.location.href = "/";
>>>>>>> 9d03a9ca (feat(UI-1191): organizations settings - optimization)
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[logout]
	);

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

				const { data: user, error } = await getLoggedInUser();
				if (error) {
					addToast({
						message: t("errors.loginFailedTryAgainLater"),
						type: "error",
						hideSystemLogLinkOnError: true,
					});
					setIsLoggingIn(false);

					return await handleLogout(false);
				}

				const { data: userOrganization, error: errorOrganization } = await OrganizationsService.get(
					user!.defaultOrganizationId
				);
				if (errorOrganization || !userOrganization) {
					addToast({
						message: t("errors.userOrganizationIsMissing"),
						type: "error",
						hideSystemLogLinkOnError: true,
					});
					setIsLoggingIn(false);

					return await handleLogout(false);
				}

				setCurrentOrganization(userOrganization);
				clearLogs();
				gTagEvent(googleTagManagerEvents.login, { method: "descope", ...user });
				setIdentity(user!.email);
			} catch (error) {
				addToast({
					message: t("errors.loginFailedTryAgainLater"),
					type: "error",
					hideSystemLogLinkOnError: true,
				});
				setIsLoggingIn(false);

				LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailedExtended", { error }), true);
				return await handleLogout(false);
			}
			setIsLoggingIn(false);
			setDescopeRenderKey((prevKey) => prevKey + 1);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[getLoggedInUser]
	);

	const isLoggedIn = user && Cookies.get(isLoggedInCookie);

	if (playwrightTestsAuthBearer || apiToken || isLoggedIn) {
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

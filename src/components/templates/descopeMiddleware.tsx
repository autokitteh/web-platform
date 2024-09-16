import React, { useCallback, useEffect, useState } from "react";

import { Descope, useDescope } from "@descope/react-sdk";
import axios from "axios";
import Cookies from "js-cookie";
import psl from "psl";
import { useTranslation } from "react-i18next";

import { authBearer, isLoggedInCookie, namespaces } from "@constants";
import { LoggerService } from "@services/logger.service";
import { getApiBaseUrl, getCookieDomain } from "@src/utilities";
import { useUserStore } from "@store/useUserStore";

import { useToastStore } from "@store";

import { Badge, Frame, LogoCatLarge } from "@components/atoms";

import { IconLogoAuth } from "@assets/image";

export const DescopeMiddleware = ({ children }: { children: React.ReactNode }) => {
	const { getLoggedInUser, setLogoutFunction } = useUserStore();
	const { logout } = useDescope();

	const handleLogout = useCallback(async () => {
		await logout();
		const rootDomain = psl.parse(window.location.hostname);
		if (rootDomain.error) {
			console.error(rootDomain.error.message);

			return;
		}

		Cookies.remove(isLoggedInCookie, { domain: getCookieDomain(rootDomain) });

		window.localStorage.clear();
		window.location.reload();
	}, [logout]);
	const addToast = useToastStore((state) => state.addToast);
	const { t } = useTranslation("login");
	const benefits = Object.values(t("benefits", { returnObjects: true }));

	const [descopeRenderKey, setDescopeRenderKey] = useState(0);

	useEffect(() => {
		setLogoutFunction(handleLogout);
	}, [handleLogout, setLogoutFunction]);

	const handleSuccess = useCallback(
		async (event: CustomEvent<any>) => {
			try {
				const apiBaseUrl = getApiBaseUrl();

				await axios.get(`${apiBaseUrl}/auth/descope/login?jwt=${event.detail.sessionJwt}`, {
					withCredentials: true,
				});
				await getLoggedInUser();
			} catch (error) {
				addToast({
					message: `Error occurred during login: ${(error as Error).message}`,
					type: "error",
				});
				LoggerService.error(
					namespaces.projectUICode,
					`Error occurred during login: ${(error as Error).message}`
				);
			} finally {
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
		<div className="m-auto flex h-screen w-full max-w-[1200px] flex-col pb-10 pt-5">
			<IconLogoAuth />

			<div className="flex flex-1">
				<div className="flex h-full w-1/2 justify-center rounded-2xl px-8 pt-12">
					<div className="max-w-96">
						<Descope flowId="sign-up-or-in" key={descopeRenderKey} onSuccess={handleSuccess} />
					</div>
				</div>

				<Frame className="flex h-full w-1/2 items-center overflow-hidden bg-gray-150 pt-20">
					<h2 className="text-3xl font-bold text-black">{t("whyDevelopersLove")}</h2>

					<div className="mt-8 flex max-w-485 flex-wrap gap-3.5">
						{benefits.map((name, index) => (
							<Badge className="z-10 bg-white px-4 py-2 text-base font-normal" key={index}>
								{t(name)}
							</Badge>
						))}
					</div>

					<LogoCatLarge className="!-bottom-5 !-right-5 opacity-100" />
				</Frame>
			</div>
		</div>
	);
};

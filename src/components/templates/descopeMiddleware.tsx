import React, { useCallback, useEffect, useState } from "react";

import { Descope, useDescope } from "@descope/react-sdk";
import axios from "axios";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

import { authBearer, isLoggedInCookie } from "@constants";
import { getApiBaseUrl } from "@src/utilities";
import { useUserStore } from "@store/useUserStore";

import { useToastStore } from "@store";

import { Badge, Frame, LogoCatLarge } from "@components/atoms";

import { IconLogoAuth } from "@assets/image";

export const DescopeMiddleware = ({ children }: { children: React.ReactNode }) => {
	const { getLoggedInUser, setLogoutFunction } = useUserStore();
	const { logout } = useDescope();

	const handleLogout = useCallback(() => {
		Cookies.remove(isLoggedInCookie);
		logout();
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
					id: Date.now().toString(),
					message: `Error occurred during login: ${(error as Error).message}`,
					type: "error",
				});
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
		<div className="flex h-screen w-screen flex-col pb-10 pl-10 pr-9 pt-5">
			<IconLogoAuth />

			<div className="flex flex-1 items-center justify-between">
				<div className="flex h-full w-1/2 items-center justify-center rounded-2xl px-8 py-10">
					<div className="max-w-96">
						<Descope flowId="sign-up-or-in" key={descopeRenderKey} onSuccess={handleSuccess} />
					</div>
				</div>

				<Frame className="flex h-full w-1/2 items-center justify-center overflow-hidden bg-gray-150">
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

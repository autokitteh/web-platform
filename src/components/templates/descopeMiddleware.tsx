import React, { ReactNode, useCallback, useEffect, useState } from "react";

import { Descope, useDescope } from "@descope/react-sdk";
import axios from "axios";
import Cookies from "js-cookie";
import psl from "psl";
import { useTranslation } from "react-i18next";

import { authBearer, isLoggedInCookie, namespaces } from "@constants";
import { LoggerService } from "@services/index";
import { getApiBaseUrl, getCookieDomain } from "@src/utilities";
import { useUserStore } from "@store/useUserStore";

import { useToastStore } from "@store";

import { IconSvg } from "@components/atoms";

import { AKRoundLogo, LoginLogos, inJustTitle } from "@assets/image";

export const DescopeMiddleware = ({ children }: { children: ReactNode }) => {
	const { getLoggedInUser, setLogoutFunction } = useUserStore();
	const { logout } = useDescope();
	const { t } = useTranslation("login");
	const addToast = useToastStore((state) => state.addToast);

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
			try {
				const apiBaseUrl = getApiBaseUrl();

				await axios.get(`${apiBaseUrl}/auth/descope/login?jwt=${event.detail.sessionJwt}`, {
					withCredentials: true,
				});
				const error = await getLoggedInUser();
				if (error) {
					addToast({
						message: t("errors.loginFailed", { error }),
						type: "error",
					});
				}
			} catch (error) {
				addToast({
					message: t("errors.loginFailed", { error }),
					type: "error",
				});
				LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailed", { error }));
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

	const benefitsList = Object.values(t("rightSide.benefitsList", { returnObjects: true }));

	return (
		<div className="flex h-screen">
			<div className="my-6 flex w-1/2 flex-col items-center justify-center rounded-r-xl bg-gray-1250 p-8 font-averta text-white">
				<IconSvg className="mb-4" size="3xl" src={AKRoundLogo} />

				<h1 className="text-center font-averta text-4xl font-semibold">
					{t("leftSide.welcomeTitle")}

					<span className="flex items-center justify-center rounded-full bg-green-800 p-1 pt-0 font-bold text-black">
						{t("leftSide.autokittehGreenTitle")}
					</span>
				</h1>

				<Descope flowId="sign-up-or-in" key={descopeRenderKey} onSuccess={handleSuccess} />

				<a
					className="font-averta text-lg text-green-800 hover:text-gray-500"
					href="https://autokitteh.com/get-a-demo/"
					rel="noreferrer"
					target="_blank"
				>
					{t("leftSide.register")}
				</a>
			</div>

			<div className="relative z-10 m-10 mr-20 flex w-2/3 flex-col justify-center rounded-3xl pb-32 pl-16 text-black">
				<h2 className="font-averta text-4xl font-bold">{t("rightSide.titleFirstLine")}</h2>

				<div className="mb-4 flex">
					<IconSvg className="ml-4 mr-2 h-10 w-24" size="3xl" src={inJustTitle} />

					<h2 className="font-averta text-4xl font-bold">{t("rightSide.titleSecondLine")}</h2>
				</div>

				<h3 className="font-averta text-2xl font-bold">{t("rightSide.descriptionFirstLine")}</h3>

				<h3 className="mb-12 font-averta text-2xl font-bold">{t("rightSide.descriptionSecondLine")}</h3>

				<ul className="font-averta text-xl font-semibold">
					{benefitsList?.length
						? Object.values(benefitsList).map((benefit) => (
								<li className="before:size-1.5 before:bg-black" key={benefit}>
									{benefit}
								</li>
							))
						: null}
				</ul>
			</div>

			<img
				alt="autokitteh logo with integrations"
				className="absolute bottom-0 right-8 h-screen/27 w-1/2 object-contain object-bottom"
				src={LoginLogos}
			/>
		</div>
	);
};

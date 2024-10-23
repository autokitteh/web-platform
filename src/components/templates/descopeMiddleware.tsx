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

import { AHref, IconSvg } from "@components/atoms";

import { AKRoundLogo } from "@assets/image";
import { InJustTitle, LoginLogos } from "@assets/image/pages/login";

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
			<div className="relative flex w-2/3 items-center justify-center rounded-3xl pb-32 pl-16 text-black">
				<div className="z-10 p-5">
					<AHref
						ariaLabel={t("leftSide.logoText")}
						className="absolute left-4 top-4 flex h-auto items-center"
						href="https://autokitteh.com/"
						relationship="noreferrer"
						target="_blank"
						title={t("leftSide.logoText")}
					>
						<IconSvg className="top-8 size-10" src={AKRoundLogo} />{" "}
						<div className="ml-3 font-averta text-2xl font-bold">{t("leftSide.logoText")}</div>
					</AHref>
					<h2 className="mt-16 font-averta text-4xl font-bold">{t("rightSide.titleFirstLine")}</h2>

					<div className="flex">
						<IconSvg className="ml-4 mr-2 h-10 w-24" size="3xl" src={InJustTitle} />

						<h2 className="font-averta text-4xl font-bold">{t("rightSide.titleSecondLine")}</h2>
					</div>

					<h3 className="mt-12 max-w-485 font-averta text-2xl font-bold">
						{t("rightSide.descriptionFirstLine")}
					</h3>

					<ul className="ml-4 mt-10 font-averta text-xl font-semibold">
						{benefitsList?.length
							? Object.values(benefitsList).map((benefit) => (
									<li className="mt-2 before:size-1 before:bg-black" key={benefit}>
										{benefit}
									</li>
								))
							: null}
					</ul>
				</div>
				<IconSvg
					alt="autokitteh logo with integrations"
					className="absolute bottom-0 right-8 h-36 w-9/12 object-contain object-bottom"
					src={LoginLogos}
				/>
			</div>

			<div className="z-10 flex w-7/12 shrink-0 flex-col items-center justify-center rounded-l-2xl bg-gray-1250 p-8 font-averta text-white">
				<h1 className="text-center font-averta text-4xl font-semibold">
					{t("leftSide.welcomeTitle")}
					<br />
					{t("leftSide.autokittehGreenTitle")}
				</h1>

				<Descope flowId="sign-up-or-in" key={descopeRenderKey} onSuccess={handleSuccess} />

				<div>
					{t("leftSide.signupText")}{" "}
					<AHref
						className="font-averta text-green-800 hover:text-gray-500"
						href="https://autokitteh.com/get-a-demo/"
						relationship="noreferrer"
						target="_blank"
					>
						{t("leftSide.signupLink")}
					</AHref>
				</div>
			</div>
		</div>
	);
};

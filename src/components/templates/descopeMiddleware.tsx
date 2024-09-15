import React, { ReactNode, useCallback, useEffect, useState } from "react";

import { Descope, useDescope } from "@descope/react-sdk";
import axios from "axios";
import Cookies from "js-cookie";
import psl from "psl";
import { useTranslation } from "react-i18next";

import { authBearer, isLoggedInCookie } from "@constants";
import { getApiBaseUrl, getCookieDomain } from "@src/utilities";
import { useUserStore } from "@store/useUserStore";

import { useToastStore } from "@store";

import { IconSvg } from "@components/atoms";

import { LoginIntegrationsLogoPng, inJustTitle } from "@assets/image";

export const DescopeMiddleware = ({ children }: { children: ReactNode }) => {
	const { getLoggedInUser, setLogoutFunction } = useUserStore();
	const { logout } = useDescope();
	const { t } = useTranslation("login");

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
		<div className="flex h-screen bg-white">
			<div className="flex w-1/2 flex-col items-center justify-center p-8 font-averta text-black">
				<h1 className="mb-16 text-center font-averta text-4xl font-semibold">
					{t("leftSide.welcomeTitle")}

					<span className="flex items-center justify-center rounded-full bg-green-800 p-1 pt-0 font-bold">
						{t("leftSide.autokittehGreenTitle")}
					</span>
				</h1>

				<div className="max-w-96">
					<Descope flowId="sign-up-or-in" key={descopeRenderKey} onSuccess={handleSuccess} />
				</div>

				<a
					className="font-averta text-lg text-gray-1250 hover:text-gray-800"
					href="https://autokitteh.com/get-a-demo/"
					rel="noreferrer"
					target="_blank"
				>
					Register
				</a>
			</div>

			<div className="relative m-10 mr-20 flex w-2/3 flex-col justify-center rounded-3xl bg-gray-1250 pb-32 pl-16 text-white">
				<h2 className="mb-4 font-averta text-4xl font-bold">
					{t("rightSide.titleFirstLine")}

					<div className="flex">
						<IconSvg
							className="mr-2 h-10 w-24 fill-white group-hover:fill-green-800"
							size="3xl"
							src={inJustTitle}
						/>

						{t("rightSide.titleSecondLine")}
					</div>
				</h2>

				<h3 className="mb-12 font-averta text-2xl font-bold">
					<div>{t("rightSide.descriptionFirstLine")}</div>

					<div>{t("rightSide.descriptionSecondLine")}</div>
				</h3>

				<ul className="mb-8 list-inside list-disc font-averta text-xl font-semibold">
					{benefitsList?.length
						? Object.values(benefitsList).map((benefit) => <li key={benefit}>{benefit}</li>)
						: null}
				</ul>

				<img
					alt="autokitteh logo with integrations"
					className="absolute -right-8 bottom-12 h-5/6"
					src={LoginIntegrationsLogoPng}
				/>
			</div>
		</div>
	);
};

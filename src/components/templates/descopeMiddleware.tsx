import { IconLogoAuth } from "@assets/image";
import { Badge, Frame, LogoCatLarge } from "@components/atoms";
import { baseUrl } from "@constants";
import { Descope, useDescope } from "@descope/react-sdk";
import { useProjectStore, useToastStore } from "@store";
import { useUserStore } from "@store/useUserStore";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const DescopeMiddleware = ({ children }: { children: React.ReactNode }) => {
	const { getProjectMenutItems, reset: resetProjectStore } = useProjectStore();
	const { getLoggedInUser, reset: resetUserStore, setLogoutFunction, user } = useUserStore();
	const { logout } = useDescope();
	const handleLogout = useCallback(() => {
		resetProjectStore();
		resetUserStore();
		logout();
	}, [resetProjectStore, resetUserStore, logout]);
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
				await axios.get(`${baseUrl}/auth/descope/login?jwt=${event.detail.sessionJwt}`, {
					withCredentials: true,
				});
				await getLoggedInUser();
				await getProjectMenutItems();
			} catch (error) {
				setDescopeRenderKey((prevKey) => prevKey + 1);
				addToast({
					id: Date.now().toString(),
					message: `Error occurred during login: ${(error as Error).message}`,
					type: "error",
				});
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[getLoggedInUser, getProjectMenutItems]
	);

	if (!user) {
		return (
			<div className="flex flex-col h-screen pb-10 pl-10 pr-9 pt-5 w-screen">
				<IconLogoAuth />

				<div className="flex flex-1 items-center justify-between">
					<div className="flex h-full items-center justify-center px-8 py-10 rounded-2xl w-1/2">
						<div className="max-w-96">
							<Descope flowId="sign-up-or-in" key={descopeRenderKey} onSuccess={handleSuccess} />
						</div>
					</div>

					<Frame className="bg-gray-black-100 flex h-full items-center justify-center w-1/2">
						<h2 className="font-bold text-3xl text-black">{t("whyDevelopersLove")}</h2>

						<div className="flex flex-wrap gap-3.5 max-w-485 mt-8">
							{benefits.map((name, index) => (
								<Badge className="bg-white font-normal px-4 py-2 text-base z-10" key={index}>
									{t(name)}
								</Badge>
							))}
						</div>

						<LogoCatLarge className="!-bottom-5 !-right-5 opacity-100" />
					</Frame>
				</div>
			</div>
		);
	}

	return children;
};

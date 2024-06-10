import React, { useCallback, useEffect } from "react";
import { IconLogoAuth } from "@assets/image";
import { Badge, Frame, LogoCatLarge } from "@components/atoms";
import { baseUrl } from "@constants";
import { Descope, useDescope } from "@descope/react-sdk";
import { useProjectStore, useToastStore } from "@store";
import { useUserStore } from "@store/useUserStore";
import { cn } from "@utilities";
import axios from "axios";
import { useTranslation } from "react-i18next";

export const DescopeMiddleware = ({ children }: { children: React.ReactNode }) => {
	const { reset: resetProjectStore, getProjectMenutItems } = useProjectStore();
	const { reset: resetUserStore, setLogoutFunction, user, getLoggedInUser } = useUserStore();
	const { logout } = useDescope();
	const handleLogout = useCallback(() => {
		resetProjectStore();
		resetUserStore();
		logout();
	}, [resetProjectStore, resetUserStore, logout]);
	const { t: tErrors } = useTranslation(["errors"]);
	const addToast = useToastStore((state) => state.addToast);
	const { t } = useTranslation("login");
	const benefits = Object.values(t("benefits", { returnObjects: true }));

	useEffect(() => {
		setLogoutFunction(handleLogout);
	}, [handleLogout, setLogoutFunction]);

	const handleSuccess = useCallback(
		async (e: CustomEvent<any>) => {
			try {
				await axios.get(`${baseUrl}/auth/descope/login?jwt=${e.detail.sessionJwt}`, { withCredentials: true });
				await getLoggedInUser();
				await getProjectMenutItems();
			} catch (error) {
				addToast({
					id: Date.now().toString(),
					message: `Error occurred during login: ${(error as Error).message}`,
					type: "error",
					title: tErrors("error"),
				});
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[getLoggedInUser, getProjectMenutItems]
	);

	if (!user) {
		return (
			<div className="w-screen h-screen pt-5 pb-10 pr-9 pl-10 flex flex-col">
				<IconLogoAuth />
				<div className="flex items-center justify-between flex-1">
					<div
						className={cn(
							"px-8 py-10 rounded-2xl relative flex flex-col w-1/2",
							"h-full justify-center items-center w-[46vw]"
						)}
					>
						<div className="w-[25vw]">
							<Descope flowId="sign-up-or-in" onSuccess={handleSuccess} />
						</div>
					</div>
					<Frame
						className={cn(
							"relative flex flex-col items-center w-1/2 h-full",
							" bg-gray-black-100 justify-center items-center"
						)}
					>
						<h2 className="z-10 text-3xl font-bold text-black">{t("whyDevelopersLove")}</h2>
						<div className="flex flex-wrap gap-3.5 mt-8 max-w-485">
							{benefits.map((name, idx) => (
								<Badge className="z-10 px-4 py-2 text-base font-normal bg-white" key={idx}>
									{t(name)}
								</Badge>
							))}
						</div>
						<LogoCatLarge className="opacity-100 !-bottom-5 !-right-5" />
					</Frame>
				</div>
			</div>
		);
	}

	return children;
};

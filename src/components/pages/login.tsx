import React from "react";

import { Descope } from "@descope/react-sdk";
import { useTranslation } from "react-i18next";

import { LoginPageProps } from "@src/interfaces/components";

import { AHref, IconSvg, Loader } from "@components/atoms";

import { AKRoundLogo } from "@assets/image";

const Login = ({ descopeRenderKey, handleSuccess, isLoggingIn }: LoginPageProps) => {
	const { t } = useTranslation("login");

	return (
		<div className="h-screen w-full">
			<div className="relative flex size-full flex-col items-center justify-center bg-gray-1250 p-8 py-12 font-averta text-white">
				<AHref
					ariaLabel={t("branding.logoText")}
					className="absolute left-6 top-6 flex h-auto items-center"
					href="https://autokitteh.com/"
					relationship="noreferrer"
					target="_blank"
					title={t("branding.logoText")}
				>
					<IconSvg className="size-10 fill-white" src={AKRoundLogo} />
					<div className="ml-4 font-averta text-2xl font-bold">{t("branding.logoText")}</div>
				</AHref>
				<div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-gray-300 p-10">
					<h1 className="text-center font-averta text-4xl font-semibold">
						{t("branding.welcomeTitle")} {t("branding.companyName")}
					</h1>
					<h2 className="mt-4 text-center text-xl">
						Vibe Automation & API Integrations
						<br />
						for Builders
					</h2>
					<div className="grow" />
					<div className="-mb-6 flex flex-col items-center gap-2">
						<h3 className="text-xl">{t("form.signUpOrSignIn")}</h3>
						{isLoggingIn ? (
							<Loader className="h-36" size="md" />
						) : (
							<Descope flowId="sign-up-or-in" key={descopeRenderKey} onSuccess={handleSuccess} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;

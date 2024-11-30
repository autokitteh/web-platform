import React, { Suspense, lazy } from "react";

import { Descope } from "@descope/react-sdk";
import { useTranslation } from "react-i18next";

import { LoginPageProps } from "@src/interfaces/components";

import { AHref, IconSvg, Loader } from "@components/atoms";

import { AKRoundLogo } from "@assets/image";
import { InJustTitle } from "@assets/image/pages/login";

const LoginLogos = lazy(() => import("@assets/image/pages/login/BottomLogos.svg?react"));

const LazyLoginLogos = () => (
	<Suspense fallback={<div />}>
		<IconSvg
			alt="autokitteh logo with integrations"
			className="absolute bottom-0 right-8 h-36 w-9/12 object-contain object-bottom"
			src={LoginLogos}
		/>
	</Suspense>
);

const Login = ({ descopeRenderKey, handleSuccess, isLoggingIn }: LoginPageProps) => {
	const { t } = useTranslation("login");
	const benefitsList = Object.values(t("rightSide.benefitsList", { returnObjects: true }));

	return (
		<div className="flex flex-col-reverse sm:h-screen sm:flex-row">
			<div className="relative flex w-full items-center justify-center p-4 pb-32 text-black sm:w-2/3 sm:rounded-3xl sm:pl-16">
				<div className="z-10 flex flex-col p-2 sm:p-5">
					<AHref
						ariaLabel={t("leftSide.logoText")}
						className="relative flex h-auto items-center sm:absolute sm:left-4 sm:top-4"
						href="https://autokitteh.com/"
						relationship="noreferrer"
						target="_blank"
						title={t("leftSide.logoText")}
					>
						<IconSvg className="top-8 size-10" src={AKRoundLogo} />
						<div className="ml-3 font-averta text-2xl font-bold">{t("leftSide.logoText")}</div>
					</AHref>
					<h2 className="mt-8 font-averta text-3xl font-bold md:text-4xl">{t("rightSide.titleFirstLine")}</h2>
					<div className="flex">
						<IconSvg className="ml-4 mr-2 h-10 w-24" size="3xl" src={InJustTitle} />
						<h2 className="font-averta text-2xl font-bold md:text-4xl">{t("rightSide.titleSecondLine")}</h2>
					</div>
					<h3 className="mt-12 max-w-485 font-averta text-2xl md:font-bold">
						{t("rightSide.descriptionFirstLine")}
					</h3>
					<ul className="ml-4 mt-10 font-averta text-xl md:font-semibold">
						{benefitsList?.length
							? Object.values(benefitsList).map((benefit) => (
									<li className="mt-2 before:size-1 before:bg-black" key={benefit}>
										{benefit}
									</li>
								))
							: null}
					</ul>
				</div>
				<LazyLoginLogos />
			</div>
			<div className="z-10 flex w-full shrink-0 flex-col items-center justify-center bg-gray-1250 p-8 py-12 font-averta text-white sm:w-7/12 sm:rounded-l-2xl">
				<h1 className="text-center font-averta text-4xl font-semibold">
					{t("leftSide.welcomeTitle")}
					<br />
					{t("leftSide.autokittehGreenTitle")}
				</h1>
				<h2 className="mt-6 text-xl md:invisible">Log in or Sign up</h2>
				{isLoggingIn ? (
					<Loader className="my-8 h-36" size="md" />
				) : (
					<Descope flowId="sign-up-or-in" key={descopeRenderKey} onSuccess={handleSuccess} />
				)}
				<div>
					<AHref
						className="font-averta text-green-800 underline hover:text-gray-500"
						href="https://autokitteh.com/get-a-demo/"
						relationship="noreferrer"
						target="_blank"
					>
						Website
					</AHref>
				</div>
			</div>
		</div>
	);
};

export default Login;

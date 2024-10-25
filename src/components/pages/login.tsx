import React, { Suspense, lazy } from "react";

import { Descope } from "@descope/react-sdk";

import { LoginPageProps } from "@src/interfaces/components";

import { AHref, IconSvg } from "@components/atoms";

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

const Login = ({ descopeRenderKey, handleSuccess, t }: LoginPageProps) => {
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
						<IconSvg className="top-8 size-10" src={AKRoundLogo} />
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
				<LazyLoginLogos />
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

export default Login;

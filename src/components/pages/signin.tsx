import React from "react";
import { IconGithub, IconGoogle } from "@assets/image/icons";
import { Frame, Badge, Button, Icon, LogoCatLarge } from "@components/atoms";
import { SignInForm } from "@components/organisms";
import { AuthWrapper } from "@components/templates";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const SignIn = () => {
	const { t } = useTranslation("login");
	const benefits = Object.values(t("benefits", { returnObjects: true }));

	return (
		<AuthWrapper>
			<div className="flex items-center justify-between flex-1 gap-20 mt-5">
				<div className="m-auto text-black max-w-96">
					<h1 className="text-5xl font-semibold text-center">{t("welcome")}</h1>
					<Button
						className={cn(
							"justify-center hover:bg-green-light text-base",
							"font-semibold py-3.5 rounded-full mt-14 border-black w-full"
						)}
						variant="outline"
					>
						<Icon alt="Github" className="w-7 h-7" src={IconGithub} /> {t("signUpWithGithub")}
					</Button>
					<Button
						className={cn(
							"justify-center hover:bg-green-light text-base",
							"font-semibold py-3.5 rounded-full mt-4 border-black w-full"
						)}
						variant="outline"
					>
						<Icon alt="Google" className="w-7 h-7" src={IconGoogle} /> {t("signUpWithGoogle")}
					</Button>
					<div className="flex items-center justify-center my-6 opacity-50">
						<div className="flex-grow border-t border-gray-700" />
						<span className="mx-3 text-gray-700">{t("or")}</span>
						<div className="flex-grow border-t border-gray-700" />
					</div>
					<p className="mb-4 font-bold text-center">{t("useYourEmail")}</p>
					<SignInForm />
					<p className="mt-3 text-xs text-center text-gray-400">
						{t("meansAgreement")}{" "}
						<Link className="underline hover:text-green-accent" to="#">
							{t("privacyPolicy")}
						</Link>{" "}
						{t("and")}{" "}
						<Link className="underline hover:text-green-accent" to="#">
							{t("termsOfService")}
						</Link>
						.
					</p>
					<p className="mt-8 text-lg text-center text-gray-400">
						{t("alreadyHaveAccount")}{" "}
						<Link className="text-gray-800 hover:text-green-accent" to="#">
							{t("signIn")}
						</Link>
					</p>
				</div>
				<Frame className="relative flex flex-col items-center w-1/2 h-full bg-gray-black-100 pt-52">
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
		</AuthWrapper>
	);
};

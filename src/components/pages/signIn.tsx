import React from "react";
import { LogoFrame } from "@assets/image";
import { IconGithub, IconGoogle } from "@assets/image/icons";
import { Frame, Badge, Button, Icon } from "@components/atoms";
import { SignInForm } from "@components/organisms";
import { AuthWrapper } from "@components/templates";
import { autokittehBenefits } from "@constants/lists";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const SignIn = () => {
	const { t } = useTranslation("login");

	return (
		<AuthWrapper>
			<div className="mt-5 flex justify-between items-center flex-1 gap-20">
				<div className="text-black m-auto max-w-96">
					<h1 className="font-semibold text-5xl text-center">{t("welcome")}</h1>
					<Button
						className={cn(
							"justify-center hover:bg-green-light text-base font-semibold py-3.5 rounded-full mt-14 border-black"
						)}
						variant="outline"
					>
						<Icon alt="Github" className="w-7 h-7" src={IconGithub} /> {t("signUpWithGithub")}
					</Button>
					<Button
						className={cn(
							"justify-center hover:bg-green-light text-base font-semibold py-3.5 rounded-full mt-4 border-black"
						)}
						variant="outline"
					>
						<Icon alt="Google" className="w-7 h-7" src={IconGoogle} /> {t("signUpWithGoogle")}
					</Button>
					<div className="flex items-center justify-center my-6 opacity-50">
						<div className="border-t border-gray-700 flex-grow" />
						<span className="text-gray-700 mx-3">{t("or")}</span>
						<div className="border-t border-gray-700 flex-grow" />
					</div>
					<p className="text-center font-bold mb-4">{t("useYourEmail")}</p>
					<SignInForm />
					<p className="text-center text-xs text-gray-400 mt-3">
						{t("meansAgreement")}{" "}
						<Link className="hover:text-green-accent underline" to="#">
							{t("privacyPolicy")}
						</Link>{" "}
						{t("and")}{" "}
						<Link className="hover:text-green-accent underline" to="#">
							{t("termsOfService")}
						</Link>
						.
					</p>
					<p className="text-center text-lg text-gray-400 mt-8">
						{t("alreadyHaveAccount")}{" "}
						<Link className="hover:text-green-accent text-gray-800" to="#">
							{t("signIn")}
						</Link>
					</p>
				</div>
				<Frame className="w-1/2 relative flex flex-col items-center bg-gray-black-100 h-full pt-52">
					<h2 className="font-bold text-3xl z-10 text-black">{t("whyDevelopersLove")}</h2>
					<div className="flex flex-wrap gap-3.5 mt-8 max-w-485">
						{autokittehBenefits.map((name, idx) => (
							<Badge className="bg-white px-4 py-2 font-normal text-base z-10" key={idx}>
								{t(name)}
							</Badge>
						))}
					</div>
					<LogoFrame className="absolute -bottom-5 -right-5 fill-white" />
				</Frame>
			</div>
		</AuthWrapper>
	);
};

/* eslint-disable no-console */
import React, { useEffect } from "react";

import { useDescope } from "@descope/react-sdk";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { LoginPageProps } from "@src/interfaces/components";

import { AHref, IconSvg, Loader } from "@components/atoms";
import { OAuthProviderButton } from "@components/molecules";

import { AKRoundLogo } from "@assets/image";

const oauthProviders = [
	{ id: "github", label: "GitHub" },
	{ id: "google", label: "Google" },
	{ id: "microsoft", label: "Microsoft" },
] as const;

const Login = ({ handleSuccess, isLoggingIn }: LoginPageProps) => {
	const { t } = useTranslation("login");
	const sdk = useDescope();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const code = searchParams.get("code");
		if (code) {
			console.log("OAuth callback code received:", code);

			// Complete the OAuth flow to get the session JWT
			sdk.oauth
				.exchange(code)
				.then((resp) => {
					if (resp.ok) {
						const sessionJwt = sdk.getSessionToken();
						console.log("Descope session JWT after exchange:", sessionJwt);

						if (sessionJwt) {
							handleSuccess(sessionJwt);
						}
					} else {
						console.error("OAuth exchange failed:", resp.error);
					}
					return resp;
				})
				.catch((error) => {
					console.error("OAuth exchange error:", error);
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	const handleOAuthStart = async (provider: (typeof oauthProviders)[number]["id"]) => {
		try {
			// You can add any pre-OAuth logic here
			console.log(`Starting ${provider} OAuth flow`);

			const redirectURL = window.location.origin + "/auth/callback"; // Adjust this to your callback URL
			const resp = await sdk.oauth.start(provider, redirectURL);

			if (!resp.ok) {
				console.error("Failed to start OAuth:", resp.error);
				// Handle error - maybe show a notification to user
				return;
			}

			console.log("success", resp?.data?.url);

			// Redirect to OAuth provider
			window.location.href = resp?.data?.url;
		} catch (error) {
			console.error("Error initiating OAuth:", error);
			// Handle error - maybe show a notification to user
		}
	};

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
					<h1 className="mt-2.5 text-center font-averta text-4xl font-semibold">
						{t("branding.welcomeTitle")} {t("branding.companyName")}
					</h1>
					<h2 className="mt-4 text-center text-xl">
						Vibe Automation & API Integrations
						<br />
						for Builders
					</h2>
					<div className="grow" />

					<div className="-mb-2 flex flex-col items-center gap-2">
						<h3 className="text-xl">{t("form.signUpOrSignIn")}</h3>

						{isLoggingIn ? (
							<Loader className="h-36" size="md" />
						) : (
							<div className="flex flex-col gap-3">
								{oauthProviders.map(({ id, label }) => (
									<OAuthProviderButton id={id} key={id} label={label} onClick={handleOAuthStart} />
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;

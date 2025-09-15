import React, { useEffect } from "react";

import { useDescope } from "@descope/react-sdk";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { LoginPageProps } from "@src/interfaces/components";
import { LoggerService } from "@src/services/logger.service";
import { useToastStore } from "@src/store/useToastStore";
import { validateOAuthRedirectURL } from "@utilities/validateUrl.utils";

import { AHref, IconSvg, Loader, OAuthErrorBoundary } from "@components/atoms";
import { OAuthProviderButton } from "@components/molecules";

import { AKRoundLogo } from "@assets/image";

const oauthProviders = [
	{ id: "github", label: "GitHub" },
	{ id: "google", label: "Google" },
	{ id: "microsoft", label: "Microsoft" },
] as const;

const Login = ({ handleSuccess, isLoggingIn }: LoginPageProps) => {
	const { t } = useTranslation("login");
	const { t: tAuth } = useTranslation("authentication");
	const sdk = useDescope();
	const [searchParams] = useSearchParams();
	const { addToast } = useToastStore();

	useEffect(() => {
		const code = searchParams.get("code");
		if (code) {
			// Complete the OAuth flow to get the session JWT
			sdk.oauth
				.exchange(code)
				.then((resp) => {
					if (resp.ok) {
						const sessionJwt = sdk.getSessionToken();

						if (sessionJwt) {
							handleSuccess(sessionJwt);
						}
					} else {
						LoggerService.error("OAuth exchange failed", { error: resp.error }, { consoleOnly: true });
						addToast({
							type: "error",
							title: "Error",
							message: tAuth("errors.oauthLogin"),
						});
					}
					return resp;
				})
				.catch((error) => {
					LoggerService.error("OAuth exchange error", { error }, { consoleOnly: true });
					addToast({
						type: "error",
						title: "Error",
						message: tAuth("errors.oauthLogin"),
					});
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	const handleOAuthStart = async (provider: (typeof oauthProviders)[number]["id"]) => {
		try {
			const redirectURL = window.location.origin + "/auth/callback";
			const resp = await sdk.oauth.start(provider, redirectURL);

			if (!resp.ok) {
				LoggerService.error("Failed to start OAuth", { provider, error: resp.error }, { consoleOnly: true });
				addToast({
					type: "error",
					title: "Error",
					message: tAuth("errors.oauthLogin"),
				});
				return;
			}

			// Validate OAuth redirect URL for security
			const redirectUrl = resp?.data?.url;
			if (!redirectUrl || !validateOAuthRedirectURL(redirectUrl)) {
				LoggerService.error("Invalid OAuth redirect URL received", { redirectUrl }, { consoleOnly: true });
				addToast({
					type: "error",
					title: "Error",
					message: tAuth("errors.oauthLogin"),
				});
				return;
			}

			// Redirect to OAuth provider
			window.location.href = redirectUrl;
		} catch (error) {
			LoggerService.error("Error initiating OAuth", { provider, error }, { consoleOnly: true });
			addToast({
				type: "error",
				title: "Error",
				message: tAuth("errors.oauthLogin"),
			});
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
							<OAuthErrorBoundary>
								<div className="flex flex-col gap-3">
									{oauthProviders.map(({ id, label }) => (
										<OAuthProviderButton
											id={id}
											key={id}
											label={label}
											onClick={handleOAuthStart}
										/>
									))}
								</div>
							</OAuthErrorBoundary>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;

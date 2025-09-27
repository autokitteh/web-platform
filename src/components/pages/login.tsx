import React, { useEffect } from "react";

import { useDescope } from "@descope/react-sdk";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { oauthRetryConfig } from "@constants/oauth.constants";
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
			sdk.oauth
				.exchange(code)
				.then((resp) => {
					if (resp.ok) {
						const sessionJwt = sdk.getSessionToken();

						if (sessionJwt) {
							handleSuccess(sessionJwt);
						}
					} else {
						LoggerService.error(
							t("debug.oauthExchangeFailed"),
							`Error: ${JSON.stringify(resp.error)}`,
							true
						);
						addToast({
							type: "error",
							message: tAuth("errors.oauthLogin"),
						});
					}
					return resp;
				})
				.catch((error) => {
					LoggerService.error(t("debug.oauthExchangeError"), `Error: ${String(error)}`, true);
					addToast({
						type: "error",
						message: tAuth("errors.oauthLogin"),
					});
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	const handleOAuthStart = async (provider: (typeof oauthProviders)[number]["id"], retryCount = 0) => {
		try {
			const redirectURL = window.location.origin + "/auth/callback";
			const resp = await sdk.oauth.start(provider, redirectURL);

			if (!resp.ok) {
				if (retryCount < oauthRetryConfig.maxAttempts) {
					LoggerService.warn(
						t("debug.oauthStartFailedRetrying"),
						`Provider: ${provider}, Attempt: ${retryCount + 1}, Error: ${JSON.stringify(resp.error)}`,
						true
					);
					setTimeout(
						() => handleOAuthStart(provider, retryCount + 1),
						oauthRetryConfig.baseDelayMs * (retryCount + 1)
					);
					return;
				}

				LoggerService.error(
					t("debug.failedStartOAuthAfterRetries"),
					`Provider: ${provider}, Error: ${JSON.stringify(resp.error)}`,
					true
				);
				addToast({
					type: "error",
					message: tAuth("errors.oauthLogin"),
				});
				return;
			}

			// Validate OAuth redirect URL for security
			const redirectUrl = resp?.data?.url;
			if (!redirectUrl || !validateOAuthRedirectURL(redirectUrl)) {
				LoggerService.error(t("debug.invalidOAuthRedirectUrl"), `URL: ${redirectUrl}`, true);
				addToast({
					type: "error",
					message: tAuth("errors.oauthLogin"),
				});
				return;
			}

			window.location.href = redirectUrl;
		} catch (error) {
			if (retryCount < oauthRetryConfig.maxAttempts) {
				LoggerService.warn(
					t("debug.oauthStartErrorRetrying"),
					`Provider: ${provider}, Attempt: ${retryCount + 1}, Error: ${String(error)}`,
					true
				);
				setTimeout(
					() => handleOAuthStart(provider, retryCount + 1),
					oauthRetryConfig.baseDelayMs * (retryCount + 1)
				);
				return;
			}

			LoggerService.error(
				t("debug.errorInitiatingOAuthAfterRetries"),
				`Provider: ${provider}, Error: ${String(error)}`,
				true
			);
			addToast({
				type: "error",
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
					data-testid="header-logo-link"
					href="https://autokitteh.com/"
					relationship="noreferrer"
					target="_blank"
					title={t("branding.logoText")}
				>
					<IconSvg className="size-10 fill-white" data-testid="header-logo-icon" src={AKRoundLogo} />
					<div className="ml-4 font-averta text-2xl font-bold" data-testid="header-logo-text">
						{t("branding.logoText")}
					</div>
				</AHref>

				<div
					className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-gray-300 p-10"
					data-testid="login-card"
				>
					<h1 className="mt-2.5 text-center font-averta text-4xl font-semibold" data-testid="welcome-title">
						{t("branding.welcomeTitle")} {t("branding.companyName")}
					</h1>
					<h2 className="text-center text-xl" data-testid="welcome-subtitle">
						{t("branding.tagline")}
						<br />
						{t("branding.subtitle")}
					</h2>
					<div className="grow" />

					<div className="flex flex-col items-center gap-2" data-testid="auth-section">
						<h3 className="mb-4 text-xl font-bold" data-testid="auth-heading">
							{t("form.signUpOrSignIn")}
						</h3>

						{isLoggingIn ? (
							<Loader className="h-36" data-testid="auth-loader" size="md" />
						) : (
							<OAuthErrorBoundary>
								<div className="flex flex-col gap-3" data-testid="oauth-buttons-container">
									{oauthProviders.map(({ id, label }) => (
										<OAuthProviderButton
											data-testid={`oauth-button-${id}`}
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

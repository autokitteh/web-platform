import React, { useEffect, useState } from "react";

import { useDescope } from "@descope/react-sdk";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { LoggerService } from "@src/services/logger.service";

import { OAuthErrorBoundary } from "@components/atoms";

interface OAuthResponse {
	ok: boolean;
	data?: any;
	error?: any;
}

const AuthCallbackContent = () => {
	const { t } = useTranslation("authentication");
	const location = useLocation();
	const sdk = useDescope();
	const [responseData, setResponseData] = useState<OAuthResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		const code = urlParams.get("code");
		const state = urlParams.get("state");
		const errorParam = urlParams.get("error");

		LoggerService.debug(
			"OAuth Callback Debug Info",
			`URL: ${window.location.href}, Pathname: ${location.pathname}, SearchParams: ${location.search}, Code: ${code}, State: ${state}, Error: ${errorParam}`
		);

		if (errorParam) {
			setError(`OAuth error: ${errorParam}`);
			setLoading(false);
			return;
		}

		if (code) {
			const exchangeCodeForToken = async () => {
				try {
					LoggerService.debug(
						"OAuth Exchange Attempt",
						`SDK Available: ${!!sdk}, Methods: ${sdk ? Object.keys(sdk).join(", ") : "None"}`
					);

					if (sdk.oauth && typeof sdk.oauth.exchange === "function") {
						const result = await sdk.oauth.exchange(code);
						LoggerService.debug("OAuth exchange successful", `Result: ${JSON.stringify(result)}`);
						setResponseData(result);
					} else {
						LoggerService.error(
							"OAuth exchange method not available",
							`Available OAuth methods: ${sdk?.oauth ? Object.keys(sdk.oauth).join(", ") : "None"}`,
							true
						);

						setError("OAuth exchange method not available in SDK");
					}
				} catch (error) {
					LoggerService.error("Error during OAuth exchange", `Error: ${String(error)}`, true);
					setError(`Exchange error: ${error}`);
				} finally {
					setLoading(false);
				}
			};

			exchangeCodeForToken();
		} else {
			setError("Missing code or state parameter");
			setLoading(false);
		}
	}, [location, sdk]);

	return (
		<div className="min-h-screen bg-gray-1250 p-8 text-white" data-testid="auth-callback-container">
			<div className="mx-auto max-w-4xl">
				<h1 className="mb-8 text-3xl font-bold" data-testid="callback-title">
					{t("debug.oauthCallbackTitle")}
				</h1>

				<div className="space-y-6" data-testid="callback-content">
					<div className="rounded-lg bg-gray-1200 p-6" data-testid="url-info-section">
						<h2 className="mb-4 text-xl font-semibold">{t("debug.urlInformation")}</h2>
						<div className="space-y-2 text-sm" data-testid="url-details">
							<div>
								<strong>{t("debug.fullUrl")}</strong> {window.location.href}
							</div>
							<div>
								<strong>{t("debug.pathname")}</strong> {location.pathname}
							</div>
							<div>
								<strong>{t("debug.search")}</strong> {location.search}
							</div>
						</div>
					</div>

					<div className="rounded-lg bg-gray-1200 p-6" data-testid="url-params-section">
						<h2 className="mb-4 text-xl font-semibold">{t("debug.urlParameters")}</h2>
						<pre className="overflow-auto rounded bg-gray-1100 p-4 text-sm" data-testid="url-params-json">
							{JSON.stringify(
								Object.fromEntries(new URLSearchParams(location.search).entries()),
								null,
								2
							)}
						</pre>
					</div>

					{loading ? (
						<div className="rounded-lg border border-blue-500 bg-gray-1100 p-6" data-testid="loading-state">
							<div className="text-center">
								<div className="text-lg text-blue-500" data-testid="loading-message">
									{t("debug.processingCallback")}
								</div>
							</div>
						</div>
					) : null}

					{error ? (
						<div className="rounded-lg border border-red-500 bg-gray-1100 p-6" data-testid="error-state">
							<h2 className="mb-4 text-xl font-semibold">{t("debug.error")}</h2>
							<div className="text-red-500" data-testid="error-message">
								{error}
							</div>
						</div>
					) : null}

					{responseData ? (
						<div
							className="rounded-lg border border-green-500 bg-gray-1100 p-6"
							data-testid="success-state"
						>
							<h2 className="mb-4 text-xl font-semibold">{t("debug.responseData")}</h2>
							<pre className="overflow-auto rounded bg-gray-1050 p-4 text-sm" data-testid="response-data">
								{JSON.stringify(responseData, null, 2)}
							</pre>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};

export const AuthCallback = () => {
	return (
		<OAuthErrorBoundary>
			<AuthCallbackContent />
		</OAuthErrorBoundary>
	);
};

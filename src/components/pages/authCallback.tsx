import React, { useEffect, useState } from "react";

import { useDescope } from "@descope/react-sdk";
import { useLocation } from "react-router-dom";

import { LoggerService } from "@src/services/logger.service";

import { OAuthErrorBoundary } from "@components/atoms";

const AuthCallbackContent = () => {
	const location = useLocation();
	const sdk = useDescope();
	const [responseData, setResponseData] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		const code = urlParams.get("code");
		const state = urlParams.get("state");
		const errorParam = urlParams.get("error");

		LoggerService.debug(
			"OAuth Callback Debug Info",
			{
				fullUrl: window.location.href,
				pathname: location.pathname,
				searchParams: location.search,
				code,
				state,
				errorParam,
				allUrlParams: Object.fromEntries(urlParams.entries()),
			},
			{ consoleOnly: true }
		);

		if (errorParam) {
			setError(`OAuth error: ${errorParam}`);
			setLoading(false);
			return;
		}

		if (code && state) {
			const exchangeCodeForToken = async () => {
				try {
					LoggerService.debug(
						"OAuth Exchange Attempt",
						{
							sdkAvailable: !!sdk,
							sdkMethods: sdk ? Object.keys(sdk) : [],
							oauthMethods: sdk?.oauth ? Object.keys(sdk.oauth) : "No oauth property",
						},
						{ consoleOnly: true }
					);

					// Try different methods to exchange the code
					if (sdk.oauth && typeof sdk.oauth.exchange === "function") {
						const result = await sdk.oauth.exchange(code);
						LoggerService.debug("OAuth exchange successful", { result }, { consoleOnly: true });
						setResponseData(result);
					} else {
						LoggerService.error(
							"OAuth exchange method not available",
							{
								availableOAuthMethods: sdk?.oauth ? Object.keys(sdk.oauth) : [],
							},
							{ consoleOnly: true }
						);

						setError("OAuth exchange method not available in SDK");
					}
				} catch (error) {
					LoggerService.error("Error during OAuth exchange", { error }, { consoleOnly: true });
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
		<div className="min-h-screen bg-gray-1250 p-8 text-white">
			<div className="mx-auto max-w-4xl">
				<h1 className="mb-8 text-3xl font-bold">OAuth Callback Debug</h1>

				<div className="space-y-6">
					<div className="rounded-lg bg-gray-1200 p-6">
						<h2 className="mb-4 text-xl font-semibold">URL Information</h2>
						<div className="space-y-2 text-sm">
							<div>
								<strong>Full URL:</strong> {window.location.href}
							</div>
							<div>
								<strong>Pathname:</strong> {location.pathname}
							</div>
							<div>
								<strong>Search:</strong> {location.search}
							</div>
						</div>
					</div>

					<div className="rounded-lg bg-gray-1200 p-6">
						<h2 className="mb-4 text-xl font-semibold">URL Parameters</h2>
						<pre className="overflow-auto rounded bg-gray-1100 p-4 text-sm">
							{JSON.stringify(
								Object.fromEntries(new URLSearchParams(location.search).entries()),
								null,
								2
							)}
						</pre>
					</div>

					{loading ? (
						<div className="rounded-lg border border-blue-500 bg-gray-1100 p-6">
							<div className="text-center">
								<div className="text-lg text-blue-500">Processing OAuth callback...</div>
							</div>
						</div>
					) : null}

					{error ? (
						<div className="rounded-lg border border-red-500 bg-gray-1100 p-6">
							<h2 className="mb-4 text-xl font-semibold">Error</h2>
							<div className="text-red-500">{error}</div>
						</div>
					) : null}

					{responseData ? (
						<div className="rounded-lg border border-green-500 bg-gray-1100 p-6">
							<h2 className="mb-4 text-xl font-semibold">Response Data</h2>
							<pre className="overflow-auto rounded bg-gray-1050 p-4 text-sm">
								{JSON.stringify(responseData, null, 2)}
							</pre>
						</div>
					) : null}

					<div className="rounded-lg bg-gray-1200 p-6">
						<h2 className="mb-4 text-xl font-semibold">SDK Information</h2>
						<div className="space-y-2 text-sm">
							<div>
								<strong>SDK available:</strong> {sdk ? "Yes" : "No"}
							</div>
							{sdk ? (
								<>
									<div>
										<strong>SDK methods:</strong> {Object.keys(sdk).join(", ")}
									</div>
									{sdk.oauth ? (
										<div>
											<strong>OAuth methods:</strong> {Object.keys(sdk.oauth).join(", ")}
										</div>
									) : null}
								</>
							) : null}
						</div>
					</div>
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

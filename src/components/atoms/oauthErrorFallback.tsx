import React from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { homepageURL } from "@constants/global.constants";
import { OAuthErrorFallbackProps } from "@src/interfaces/components";

export const OAuthErrorFallback = ({ error, resetError }: OAuthErrorFallbackProps) => {
	const { t } = useTranslation("authentication", { keyPrefix: "oauthError" });

	return (
		<div
			className="flex w-full flex-1 flex-col items-center justify-center py-5"
			data-testid="oauth-error-boundary"
		>
			<div className="mt-16 font-fira-code text-lg text-error" data-testid="error-message">
				{t("authenticationError")}
			</div>
			<div
				className="mt-4 max-w-md text-center font-fira-code text-sm text-gray-600"
				data-testid="error-description"
			>
				{t("errorMessage")}
			</div>
			{error?.message ? (
				<div
					className="mt-2 max-w-md text-center font-fira-code text-xs text-gray-500"
					data-testid="error-details"
				>
					{error.message}
				</div>
			) : null}
			<div className="mt-6 flex gap-4" data-testid="error-actions">
				{resetError ? (
					<button
						className="rounded bg-blue-500 px-4 py-2 font-fira-code text-sm text-white hover:opacity-80"
						data-testid="retry-button"
						onClick={resetError}
						type="button"
					>
						{t("tryAgain")}
					</button>
				) : null}
				<Link
					className="rounded border border-gray-300 px-4 py-2 font-fira-code text-sm text-gray-700 hover:bg-gray-1100"
					data-testid="back-to-home-button"
					to={homepageURL}
				>
					{t("goHome")}
				</Link>
			</div>
		</div>
	);
};

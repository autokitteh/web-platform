import React from "react";

import { useTranslation } from "react-i18next";

import { IconSvg } from "../icons";
import { isDevelopment } from "@constants";

import { ErrorIcon } from "@assets/image";

interface ErrorFallbackProps {
	error: Error;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
	const { t } = useTranslation("errors", { keyPrefix: "errorFallback" });

	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center">
			<IconSvg className="stroke-red-400" size="28" src={ErrorIcon} />

			<div className="mt-12 font-fira-code text-lg text-black">{t("title")}</div>

			<div className="mt-4 font-fira-code text-sm text-black">{t("message")}</div>

			<button
				className="mt-4 font-fira-code text-lg font-bold text-black hover:text-gray-950"
				onClick={() => window.location.reload()}
			>
				{t("reloadButton")}
			</button>

			{isDevelopment ? (
				<details className="mt-8 w-full max-w-2xl">
					<summary className="cursor-pointer font-fira-code text-sm text-black">
						{t("errorDetailsTitle")}
					</summary>
					<pre className="mt-2 whitespace-pre-wrap rounded bg-gray-100 p-4 font-fira-code text-xs text-error">
						{error.message}
						{error.stack ? `\n\n${error.stack}` : null}
					</pre>
				</details>
			) : null}
		</div>
	);
};

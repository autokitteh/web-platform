import React from "react";

import { useTranslation } from "react-i18next";

import { IconSvg } from "../icons";
import { isDevelopment } from "@constants";
import { ErrorFallbackProps } from "@interfaces/components";

import { ErrorIcon } from "@assets/image";

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
	const { t } = useTranslation("errors", { keyPrefix: "errorFallback" });

	const handleClose = () => {
		window.location.href = "/";
	};

	const handleReload = () => {
		window.location.reload();
	};

	return (
		<div className="flex h-screen w-screen flex-1">
			<div className="mr-2 flex flex-1 flex-col md:mb-2">
				<div className="flex flex-1 flex-col overflow-hidden">
					<div className="fixed inset-0 z-max flex items-center justify-center bg-gray-600/50">
						<div className="relative mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
							<button
								className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
								onClick={handleClose}
							>
								<svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										d="M6 18L18 6M6 6l12 12"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
									/>
								</svg>
							</button>

							<div className="flex flex-col items-center justify-center text-center">
								<IconSvg className="stroke-red-400" size="28" src={ErrorIcon} />

								<h1 className="mb-2 font-fira-code text-lg font-semibold text-gray-900">
									{t("title")}
								</h1>

								<p className="mb-6 font-fira-code text-sm text-gray-1000">{t("message")}</p>

								<button
									className="rounded-md bg-gray-900 px-4 py-2 font-fira-code text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
									onClick={handleReload}
								>
									{t("reloadButton")}
								</button>

								{isDevelopment ? (
									<details className="mt-4 text-left">
										<summary className="cursor-pointer font-fira-code text-xs text-gray-500">
											{t("errorDetailsTitle")}
										</summary>
										<pre className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap rounded bg-gray-100 p-2 font-fira-code text-xs text-error">
											{error.message}
											{error.stack ? `\n\n${error.stack}` : null}
										</pre>
									</details>
								) : null}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

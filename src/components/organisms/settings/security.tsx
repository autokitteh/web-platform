import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { HttpService } from "@services";
import { getApiBaseUrl } from "@src/utilities";

import { useToastStore } from "@store";

import { Button, IconSvg, Input, Loader, Typography } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { NewProject } from "@assets/image";
import { CopyIcon } from "@assets/image/icons";

export const Security = () => {
	const { t } = useTranslation("settings", { keyPrefix: "security" });
	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);
	const [token, setToken] = useState<string>("");
	const hostURL = getApiBaseUrl();

	const createToken = async () => {
		setIsLoading(true);
		const { data: jwtToken } = await HttpService.post("/auth/tokens");
		setToken(jwtToken);
		setIsLoading(false);
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);

			addToast({
				message: t("getToken.copySuccess"),
				type: "success",
			});
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			addToast({
				message: t("getToken.copyFailure"),
				type: "error",
			});
		}
	};

	return (
		<>
			<Typography className="mb-4 text-settings-title font-bold" element="h1" size="large">
				{t("getToken.title")}
			</Typography>
			<div>
				<div className="mt-6 w-2/3">
					<p className="mb-4 w-2/3">{t("getToken.subtitle")}</p>
					{token ? (
						<div className="flex w-full">
							<Input
								aria-label={t("getToken.copyInputAriaLabel")}
								className="flex-1 rounded-3xl hover:border-gray-1100"
								disabled
								label={t("getToken.copyInputAriaLabel")}
								value={token}
							/>

							<Button
								aria-label={t("getToken.copyButton")}
								className="ml-4 rounded-md border-black bg-white px-3 font-semibold hover:bg-gray-950"
								onClick={() => copyToClipboard(token)}
								variant="outline"
							>
								<CopyIcon className="h-6 w-4 fill-black" />
							</Button>
						</div>
					) : (
						<Button
							className="border border-white px-3 font-medium text-white hover:bg-gray-1300"
							onClick={createToken}
							variant="filled"
						>
							<div className="flex items-center">
								{!isLoading ? (
									<IconSvg alt="New Project" className="fill-white" size="md" src={NewProject} />
								) : null}

								{isLoading ? <Loader size="sm" /> : null}
							</div>

							<div className="mr-1 flex">{t("getToken.actionButton")}</div>
						</Button>
					)}
				</div>
				<div className="mt-10 w-2/3">
					<p className="mb-4 w-2/3">{t("hostURL.subtitle")}</p>
					<div className="flex w-full">
						<Input
							aria-label={t("hostURL.copyInputAriaLabel")}
							className="flex-1 rounded-3xl hover:border-gray-1100"
							disabled
							label={t("hostURL.copyInputAriaLabel")}
							value={hostURL}
						/>

						<Button
							aria-label={t("hostURL.copyButton")}
							className="ml-4 rounded-md border-black bg-white px-3 font-semibold hover:bg-gray-950"
							onClick={() => copyToClipboard(token)}
							variant="outline"
						>
							<CopyIcon className="h-6 w-4 fill-black" />
						</Button>
					</div>
				</div>

				<Accordion className="mt-8 w-2/3" title={t("vscodeConfigExample")}>
					<img
						alt={t("vscodeConfigExample")}
						src="/assets/image/pages/settings/vscodeConfigurationExample.png"
					/>
				</Accordion>
			</div>
		</>
	);
};

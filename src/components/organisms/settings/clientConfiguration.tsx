import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { HttpService } from "@services";
import { getApiBaseUrl } from "@src/utilities";

import { Button, IconSvg, Input, Loader, Typography } from "@components/atoms";
import { Accordion, CopyButton, ImageMotion } from "@components/molecules";

import { NewProject } from "@assets/image";

export const ClientConfiguration = () => {
	const { t } = useTranslation("settings", { keyPrefix: "clientConfiguration" });
	const [isLoading, setIsLoading] = useState(false);
	const [token, setToken] = useState<string>("");
	const hostURL = getApiBaseUrl();

	const createToken = async () => {
		setIsLoading(true);
		const { data: jwtToken } = await HttpService.post("/auth/tokens");
		setToken(jwtToken);
		setIsLoading(false);
	};

	return (
		<>
			<Typography className="mb-4 text-settings-title font-bold" element="h1" size="large">
				{t("getToken.title")}
			</Typography>
			<div>
				<div className="mt-6 h-20 w-2/3">
					<p className="mb-4">{t("getToken.subtitle")}</p>
					{token ? (
						<div className="flex w-full">
							<Input
								aria-label={t("getToken.copyInputAriaLabel")}
								className="flex-1 rounded-xl hover:border-gray-1100"
								disabled
								label={t("getToken.copyInputAriaLabel")}
								value={token}
							/>

							<CopyButton
								className="ml-4 rounded-md bg-gray-900 px-3 hover:bg-gray-950"
								successMessage={t("getToken.copySuccess")}
								text={token}
							/>
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
					<p className="mb-4">{t("hostURL.subtitle")}</p>
					<div className="flex w-full">
						<Input
							aria-label={t("hostURL.copyInputAriaLabel")}
							className="flex-1 rounded-xl hover:border-gray-1100"
							disabled
							label={t("hostURL.copyInputAriaLabel")}
							value={hostURL}
						/>

						<CopyButton
							className="ml-4 rounded-md bg-gray-900 px-3 hover:bg-gray-950"
							successMessage={t("hostURL.copySuccess")}
							text={hostURL}
						/>
					</div>
				</div>

				<Accordion className="mt-10 w-2/3" title={t("vscodeConfigExample")}>
					<ImageMotion
						alt={t("vscodeConfigExample")}
						src="/assets/image/pages/settings/vscodeConfigurationExample.jpg"
					/>
				</Accordion>
			</div>
		</>
	);
};

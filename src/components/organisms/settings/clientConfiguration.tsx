import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { AuthService } from "@services";
import { useToastStore } from "@src/store";
import { getApiBaseUrl } from "@src/utilities";

import { Button, IconSvg, Input, Loader, Typography } from "@components/atoms";
import { Accordion, CopyButton, ImageMotion } from "@components/molecules";

import { CircleTokenIcon } from "@assets/image/icons";

export const ClientConfiguration = () => {
	const { t } = useTranslation("settings", { keyPrefix: "clientConfiguration" });
	const { t: tErrors } = useTranslation("errors");
	const [isLoading, setIsLoading] = useState(false);
	const [token, setToken] = useState("");
	const hostURL = getApiBaseUrl();
	const addToast = useToastStore((state) => state.addToast);

	const createToken = async () => {
		setIsLoading(true);
		const { data: token, error } = await AuthService.createToken();
		setIsLoading(false);

		if (error) {
			addToast({
				message: tErrors("tokenCreationError"),
				type: "error",
			});

			return;
		}
		if (!token) {
			addToast({
				message: tErrors("tokenCreationError"),
				type: "error",
			});

			return;
		}

		setToken(token);
	};

	return (
		<>
			<Typography className="mb-9 font-averta font-bold" element="h1" size="2xl">
				{t("getToken.title")}
			</Typography>
			<div className="mt-9 max-w-700">
				<p className="mb-3 text-base font-light">{t("getToken.subtitle")}</p>
				{token ? (
					<div className="flex">
						<Input
							aria-label={t("getToken.copyInputAriaLabel")}
							className="mr-2 h-12 flex-1 rounded-lg border-gray-950"
							disabled
							label={t("getToken.copyInputAriaLabel")}
							value={token}
						/>

						<CopyButton size="md" successMessage={t("getToken.copySuccess")} text={token} />
					</div>
				) : (
					<Button
						className="h-11 gap-2 border border-gray-750 pl-2.5 pr-3 font-averta font-semibold text-white"
						onClick={createToken}
					>
						{!isLoading ? (
							<IconSvg alt="New Project" size="xl" src={CircleTokenIcon} />
						) : (
							<Loader size="sm" />
						)}

						{t("getToken.actionButton")}
					</Button>
				)}
			</div>
			<div className="mt-9 max-w-700">
				<p className="mb-3 text-base font-light capitalize">{t("hostURL.subtitle")}</p>
				<div className="flex">
					<Input
						aria-label={t("hostURL.copyInputAriaLabel")}
						className="mr-2 h-12 flex-1 rounded-lg border-gray-950"
						disabled
						label={t("hostURL.copyInputAriaLabel")}
						value={hostURL}
					/>

					<CopyButton size="md" successMessage={t("hostURL.copySuccess")} text={hostURL} />
				</div>
			</div>

			<Accordion className="mt-9 w-1/2" title={t("vscodeConfigExample")}>
				<ImageMotion
					alt={t("vscodeConfigExample")}
					src="/assets/image/pages/settings/vscodeConfigurationExample.jpg"
				/>
			</Accordion>
		</>
	);
};

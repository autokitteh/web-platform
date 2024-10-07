import React, { useState } from "react";

import { Trans, useTranslation } from "react-i18next";

import { HttpService } from "@services";

import { useToastStore } from "@store";

import { Button, IconSvg, Input, Loader, Typography } from "@components/atoms";

import { Plus } from "@assets/image";
import { CopyIcon } from "@assets/image/icons";

export const Security = () => {
	const { t: tSettings } = useTranslation("settings");
	const { t } = useTranslation("modals", { keyPrefix: "getToken" });
	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);
	const [token, setToken] = useState<string>("");

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
				message: t("copySuccess"),
				type: "success",
			});
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			addToast({
				message: t("copyFailure"),
				type: "error",
			});
		}
	};

	return (
		<>
			<Typography className="mb-4 text-settings-title font-bold" element="h1" size="large">
				{tSettings("security.title")}
			</Typography>
			<div>
				<p className="mb-4 w-2/3">
					<Trans
						components={{
							anchor: (
								<a
									href="https://marketplace.visualstudio.com/items?itemName=autokitteh.autokitteh"
									key="extensionLink"
									rel="noreferrer"
									target="_blank"
									title="AutoKitteh Extension"
								/>
							),
						}}
						i18nKey={t("line")}
					/>
				</p>

				<div className="w-2/3">
					{token ? (
						<div className="flex w-full">
							<Input
								aria-label={t("copyInputAriaLabel")}
								className="flex-1 rounded-3xl hover:border-gray-1100"
								disabled
								label={t("copyInputAriaLabel")}
								value={token}
							/>

							<Button
								aria-label={t("copyButton")}
								className="ml-4 rounded-md px-3 font-semibold"
								onClick={() => copyToClipboard(token)}
								variant="inverse"
							>
								<CopyIcon className="h-6 w-4 fill-black" />
							</Button>
						</div>
					) : (
						<Button className="border border-gray-500 px-3" onClick={createToken} variant="filled">
							<div className="flex items-center">
								{!isLoading ? (
									<IconSvg alt="Create Token" className="fill-gray-100" size="md" src={Plus} />
								) : null}

								{isLoading ? <Loader size="sm" /> : null}
							</div>

							<div className="mr-1 flex">{tSettings("security.creatTokenButton")}</div>
						</Button>
					)}
				</div>
			</div>
		</>
	);
};

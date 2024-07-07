import React, { useState } from "react";

import { Trans, useTranslation } from "react-i18next";

import { NewProject } from "@assets/image";
import { CopyIcon } from "@assets/image/icons";
import { Button, IconSvg, Input, Loader, Typography } from "@components/atoms";
import { HttpService } from "@services";
import { useToastStore } from "@store";

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
				id: Date.now().toString(),
				message: t("copySuccess"),
				type: "success",
			});
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: t("copyFailure"),
				type: "error",
			});
		}
	};

	return (
		<>
			<Typography className="font-bold mb-4 text-settings-title" element="h1" size="large">
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
								className="flex-1 hover:border-gray-700 rounded-3xl"
								disabled
								value={token}
							/>

							<Button
								aria-label={t("copyButton")}
								className="bg-white border-black font-semibold hover:bg-gray-300 ml-4 px-3 rounded-md"
								onClick={() => copyToClipboard(token)}
								variant="outline"
							>
								<CopyIcon className="fill-black h-6 w-4.1" />
							</Button>
						</div>
					) : (
						<Button className="border-2 border-black flex" onClick={createToken} variant="light">
							<div className="flex items-center">
								{!isLoading ? (
									<IconSvg
										alt="New Project"
										className="after:h-2 after:w-2 before:h-2 before:w-2 w-4"
										src={NewProject}
									/>
								) : null}

								{isLoading ? <Loader size="sm" /> : null}
							</div>

							<div className="flex mr-1">{tSettings("security.creatTokenButton")}</div>
						</Button>
					)}
				</div>
			</div>
		</>
	);
};

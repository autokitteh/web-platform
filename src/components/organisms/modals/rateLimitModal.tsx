import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { rateLimitModalProps } from "@interfaces/components";
import { requestBlockerCooldownMs } from "@src/constants";
import { useModalStore } from "@src/store";

import { Button, IconSvg, Typography } from "@components/atoms";
import { Modal } from "@components/molecules";

import { WarningTriangleIcon } from "@assets/image/icons";

export const RateLimitModal = ({ onOkClick, timeLeft }: rateLimitModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "rateLimit" });
	const data = useModalStore((state) => state.data) as { limit: string; resourceName: string; used: string };

	const formatTimeLeft = () => {
		const minutes = Math.floor(timeLeft / requestBlockerCooldownMs);
		const seconds = Math.floor((timeLeft % requestBlockerCooldownMs) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	return (
		<Modal name={ModalName.rateLimit}>
			<div className="mx-6 flex flex-col">
				<div className="mb-5 flex items-center gap-2">
					<IconSvg className="mb-0.5" src={WarningTriangleIcon} />
					<h3 className="text-xl font-bold">{t("title", { name: data?.resourceName })}</h3>
				</div>
				<p className="text-base">
					{t("contentLine1", { limit: data?.limit, used: data?.used, resourceName: data?.resourceName })}
					<br />
					{t("contentLine2", { used: data?.used })}
					<br />
					{t("contentLine3")}
				</p>

				{timeLeft > 0 ? (
					<Typography className="text-base text-gray-1100" element="p">
						{t("timeRemaining")}: <div className="inline font-bold">{formatTimeLeft()}</div>
					</Typography>
				) : null}
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("contactButton")}
					className="min-w-20 justify-center bg-gray-1100 px-4 py-3 font-semibold hover:text-green-800"
					onClick={onOkClick}
					variant="filled"
				>
					{t("contactButton")}
				</Button>
			</div>
		</Modal>
	);
};

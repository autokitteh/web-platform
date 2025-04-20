import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { rateLimitModalProps } from "@interfaces/components";
import { requestBlockerCooldownMs } from "@src/constants";
import { useModalStore } from "@src/store";

import { IconSvg } from "@components/atoms";
import { Modal } from "@components/molecules";

import { ErrorIcon } from "@assets/image/icons";

export const RateLimitModal = ({ timeLeft }: rateLimitModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "rateLimit" });
	const data = useModalStore((state) => state.data) as { limit: string; resourceName: string; used: string };

	const seconds = Math.floor((timeLeft % requestBlockerCooldownMs) / 1000);

	return (
		<Modal hideCloseButton name={ModalName.rateLimit}>
			<div className="mx-6 mt-3 flex flex-col">
				<div className="mb-5 flex items-center gap-2">
					<IconSvg className="mb-0.5 mr-0 fill-white" size="xl" src={ErrorIcon} />
					<h3 className="ml-0.5 text-xl font-bold">{t("title", { name: data?.resourceName })}</h3>
				</div>
				<p className="text-base">{t("contentLine1", { howMuchSeconds: seconds })}</p>
				<br />
			</div>
		</Modal>
	);
};

import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { QuotaLimitModalProps } from "@interfaces/components";
import { useModalStore } from "@src/store";

import { Button, IconSvg } from "@components/atoms";
import { Modal } from "@components/molecules";

import { ErrorIcon } from "@assets/image/icons";

export const QuotaLimitModal = ({ onContactSupportClick }: QuotaLimitModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "quotaLimit" });
	const data = useModalStore((state) => state.data) as {
		limit: string;
		resource: string;
		used: string;
	};
	if (!data) return null;

	const { used, limit, resource } = data;

	return (
		<Modal name={ModalName.quotaLimit}>
			<div className="mx-6 mt-3 flex flex-col">
				<div className="mb-5 flex items-center">
					<IconSvg className="mb-0.5 mr-0 fill-white" size="xl" src={ErrorIcon} />
					<h3 className="ml-0.5 text-xl font-bold">{t("title")}</h3>
				</div>
				<p className="text-base">{t("content1", { used, limit, resource })}</p>
				<p className="text-base">{t("content2")}</p>
				<br />

				<div className="mt-8 flex w-full justify-end">
					<Button
						ariaLabel={t("retryButton")}
						className="min-w-20 justify-center bg-gray-1100 px-4 py-3 font-semibold hover:text-green-800"
						onClick={onContactSupportClick}
						variant="filled"
					>
						{t("contactSupport")}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

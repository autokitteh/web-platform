import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { LimitReachedModalProps } from "@interfaces/components";
import { useModalStore } from "@src/store";
import { unblockRequestsImmediately } from "@src/utilities/requestBlockerUtils";

import { Button, IconSvg } from "@components/atoms";
import { Modal } from "@components/molecules";

import { WarningTriangleIcon } from "@assets/image/icons";

export const LimitReachedModal = ({ onContact, onCancel }: LimitReachedModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "limitReached" });
	const data = useModalStore((state) => state.data) as { limit: number; resourceName: string; used: number };

	const handleCancel = () => {
		// Unblock requests when user cancels
		unblockRequestsImmediately();
		if (onCancel) {
			onCancel();
		}
	};

	const handleContact = () => {
		// Unblock requests when user proceeds to contact
		unblockRequestsImmediately();
		if (onContact) {
			onContact();
		}
	};

	return (
		<Modal name={ModalName.continueTour}>
			<div className="mx-6 flex items-center gap-2">
				<IconSvg src={WarningTriangleIcon} />
				<h3 className="mb-5 text-xl font-bold">{t("title", { name: data?.resourceName })}</h3>
				<p>{t("content", { limit: data?.limit, used: data?.used })}</p>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={handleCancel}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("okButton")}
					className="min-w-20 justify-center bg-gray-1100 px-4 py-3 font-semibold hover:text-green-800"
					onClick={handleContact}
					variant="filled"
				>
					{t("contactButton")}
				</Button>
			</div>
		</Modal>
	);
};

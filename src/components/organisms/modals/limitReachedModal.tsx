import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { LimitReachedModalProps } from "@interfaces/components";
import { useModalStore } from "@src/store";
import { getTimeUntilUnblock, unblockRequestsImmediately } from "@src/utilities/requestBlockerUtils";

import { Button, IconSvg, Typography } from "@components/atoms";
import { Modal } from "@components/molecules";

import { WarningTriangleIcon } from "@assets/image/icons";

export const LimitReachedModal = ({ onContact, onCancel }: LimitReachedModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "limitReached" });
	const data = useModalStore((state) => state.data) as { limit: string; resourceName: string; used: string };
	const [timeLeft, setTimeLeft] = useState(getTimeUntilUnblock());

	useEffect(() => {
		const interval = setInterval(() => {
			const remaining = getTimeUntilUnblock();
			setTimeLeft(remaining);

			// if (remaining <= 0) {
			// 	unblockRequestsImmediately();
			// 	if (onCancel) {
			// 		onCancel();
			// 	}
			// }
		}, 1000);

		return () => clearInterval(interval);
	}, [onCancel]);

	const formatTimeLeft = () => {
		const minutes = Math.floor(timeLeft / 60000);
		const seconds = Math.floor((timeLeft % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	const handleCancel = () => {
		unblockRequestsImmediately();
		if (onCancel) {
			onCancel();
		}
	};

	const handleContact = () => {
		unblockRequestsImmediately();
		if (onContact) {
			onContact();
		}
	};

	return (
		<Modal name={ModalName.limitReached}>
			<div className="mx-6 flex flex-col">
				<div className="mb-5 flex items-center gap-2">
					<IconSvg className="mb-0.5" src={WarningTriangleIcon} />
					<h3 className="text-xl font-bold">{t("title", { name: data?.resourceName })}</h3>
				</div>
				<p className="text-base">
					{t("contentLine1", { limit: data?.limit, used: data?.used, resourceName: data?.resourceName })}
					<br />
					{t("contentLine2", { used: data?.used })}
				</p>

				{timeLeft > 0 ? (
					<Typography className="text-base text-gray-1100" element="p">
						{t("timeRemaining")}: <div className="inline font-bold">{formatTimeLeft()}</div>
					</Typography>
				) : null}
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

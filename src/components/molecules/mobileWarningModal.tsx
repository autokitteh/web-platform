import React from "react";

import { useTranslation } from "react-i18next";

import { LocalStorageKeys } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { setLocalStorageValue } from "@src/utilities/localStorage.utils";

import { useModalStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const MobileWarningModal = () => {
	const { closeModal } = useModalStore();
	const { t } = useTranslation("modals", { keyPrefix: "mobileWarning" });

	const handleOkay = () => {
		setLocalStorageValue(LocalStorageKeys.mobileWarningDismissed, "true");
		closeModal(ModalName.mobileWarning);
	};

	return (
		<Modal className="w-3/4" hideCloseButton name={ModalName.mobileWarning}>
			<div className="text-center">
				<div className="mb-6 flex justify-center">
					<div className="rounded-full bg-gradient-to-br from-green-800 to-green-700 p-4">
						<svg
							className="size-12 text-white"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
				</div>

				<h2 className="mb-4 text-2xl font-bold text-gray-1250">{t("title")}</h2>

				<p className="mb-8 text-left text-base text-gray-1000">
					<strong>{t("contentPrefix")} </strong>
					{t("content")}
				</p>

				<div className="flex w-full justify-center">
					<Button
						ariaLabel={t("okButton")}
						className="w-1/4 bg-gray-1100 px-4 py-3 font-semibold hover:text-error"
						onClick={handleOkay}
						variant="filled"
					>
						{t("okButton")}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { useModal } from "@hooks/useModal";

import { Button, IconSvg, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

import { ErrorIcon } from "@assets/image/icons";


export const RateLimitModal: React.FC = () => {
	const { t } = useTranslation("modals", { keyPrefix: "rateLimit" });
	const { getModalData, closeModal } = useModal();
	const data = getModalData(ModalName.rateLimit);
	if (!data) return null;
	const { isRetrying, onRetryClick } = data;

	return (
		<Modal name={ModalName.rateLimit}>
			<div className="mx-6 mt-3 flex flex-col">
				<div className="mb-5 flex items-center">
					<IconSvg className="mb-0.5 mr-1 fill-white" size="xl" src={ErrorIcon} />
					<h3 className="ml-0.5 text-xl font-bold">{t("title")}</h3>
				</div>
				<p className="text-base">{t("content")}</p>
				<br />

				<div className="mt-8 flex w-full justify-end">
					<Button
						ariaLabel={t("retryButton")}
						className="min-w-20 justify-center bg-gray-1100 px-4 py-3 font-semibold hover:text-green-800"
						onClick={() => { onRetryClick(); closeModal(ModalName.rateLimit); }}
						variant="filled"
					>
						{isRetrying ? (
							<>
								<Loader />
								{t("retryingButton")}
							</>
						) : (
							t("retryButton")
						)}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

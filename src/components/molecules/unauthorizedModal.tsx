import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName } from "@src/enums/components/modal.enum";

import { useModalStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const UnauthorizedModal = () => {
	const { t } = useTranslation("authentication", { keyPrefix: "unauthorized" });
	const closeModal = useModalStore((state) => state.closeModal);
	const navigate = useNavigate();

	const handleClose = () => {
		closeModal(ModalName.unauthorized);
	};

	const handleGoToDashboard = () => {
		closeModal(ModalName.unauthorized);
		navigate("/");
	};

	return (
		<Modal hideCloseButton name={ModalName.unauthorized}>
			<div className="flex flex-col gap-5 p-6">
				<div className="flex flex-col gap-2">
					<h2 className="text-2xl font-semibold text-gray-1250">{t("unauthorized")}</h2>
					<p className="text-sm text-gray-1050">{t("unauthorizedMessage")}</p>
				</div>

				<div className="flex flex-col gap-2 rounded-lg bg-gray-100 p-4">
					<ul className="list-inside list-disc space-y-1 text-sm text-gray-1050">
						<li>{t("reasons.noPermission")}</li>
						<li>{t("reasons.sessionExpired")}</li>
						<li>{t("reasons.wrongOrganization")}</li>
					</ul>
				</div>

				<div className="flex flex-col gap-2 text-sm text-gray-1050">
					<p className="font-medium text-gray-1250">{t("whatYouCanDo")}</p>
					<ul className="list-inside list-disc space-y-1">
						<li>{t("actions.contactAdmin")}</li>
						<li>{t("actions.tryAgain")}</li>
						<li>{t("actions.goToDashboard")}</li>
					</ul>
				</div>

				<div className="flex justify-end gap-3">
					<Button className="px-4 hover:text-white" onClick={handleClose} variant="outline">
						{t("closeModal")}
					</Button>
					<Button className="px-4" onClick={handleGoToDashboard} variant="filled">
						{t("goToHomepage")}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

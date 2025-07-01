import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName } from "@enums/components";
import { InitConnectionModalProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { EditConnection } from "@components/organisms/connections/edit";

export const InitConnectionModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "initConnection" });
	const { closeModal, data } = useModalStore();
	const navigate = useNavigate();
	const connectionData = data as InitConnectionModalProps | undefined;

	if (!connectionData) {
		return null;
	}

	const { projectId, connectionId, integration } = connectionData;

	const handleClose = () => {
		closeModal(ModalName.initConnection);
	};

	const handleNavigateToProject = () => {
		handleClose();
		navigate(`/projects/${projectId}`);
	};

	return (
		<Modal
			className="h-5/6 w-4/5 max-w-5xl overflow-hidden bg-gray-1250"
			closeButtonClass="p-2"
			name={ModalName.initConnection}
		>
			<div className="flex h-full flex-col p-4">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-white">{t("title", { integration })}</h3>
				</div>

				<div className="flex-1 overflow-auto">
					<EditConnection connectionId={connectionId} />
				</div>

				<div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-950 bg-gray-1250 px-4 py-3">
					<Button
						ariaLabel={t("goToProjectButton")}
						className="h-12 bg-gray-1100 px-4 py-3 font-semibold"
						onClick={handleNavigateToProject}
						variant="filled"
					>
						{t("goToProjectButton")}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

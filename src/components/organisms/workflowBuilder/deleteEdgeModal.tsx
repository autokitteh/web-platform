import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { useModalStore } from "@store/useModalStore";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteEdgeModal = () => {
	const { t } = useTranslation("workflowBuilder", { keyPrefix: "deleteModal" });
	const { closeModal, getModalData } = useModalStore();
	const { removeEdge } = useWorkflowBuilderStore();

	const modalData = getModalData<{ edgeId: string }>(ModalName.deleteWorkflowEdge);
	const edgeId = modalData?.edgeId;

	const handleDelete = useCallback(() => {
		if (edgeId) {
			removeEdge(edgeId);
		}
		closeModal(ModalName.deleteWorkflowEdge);
	}, [edgeId, removeEdge, closeModal]);

	const handleCancel = useCallback(() => {
		closeModal(ModalName.deleteWorkflowEdge);
	}, [closeModal]);

	return (
		<Modal hideCloseButton name={ModalName.deleteWorkflowEdge} variant="dark">
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold text-white">{t("title")}</h3>
				<p className="text-gray-200">{t("content")}</p>
				<p className="mt-1 text-gray-400">{t("warning")}</p>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancel")}
					className="border-gray-600 px-4 py-3 text-gray-200 hover:bg-gray-800 hover:text-white"
					onClick={handleCancel}
					variant="outline"
				>
					{t("cancel")}
				</Button>

				<Button
					ariaLabel={t("delete")}
					className="bg-error px-4 py-3 text-white hover:bg-error/80"
					onClick={handleDelete}
					variant="filled"
				>
					{t("delete")}
				</Button>
			</div>
		</Modal>
	);
};

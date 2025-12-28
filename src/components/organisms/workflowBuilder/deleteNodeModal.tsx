import React, { useCallback, useMemo } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { useModalStore } from "@store/useModalStore";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteNodeModal = () => {
	const { t } = useTranslation("workflowBuilder", { keyPrefix: "deleteNodeModal" });
	const { closeModal, getModalData } = useModalStore();
	const { removeNode, edges } = useWorkflowBuilderStore();

	const modalData = getModalData<{ nodeId: string; nodeName: string }>(ModalName.deleteWorkflowNode);
	const nodeId = modalData?.nodeId;
	const nodeName = modalData?.nodeName;

	const connectedEdgesCount = useMemo(() => {
		if (!nodeId) return 0;
		return edges.filter((edge) => edge.source === nodeId || edge.target === nodeId).length;
	}, [nodeId, edges]);

	const handleDelete = useCallback(() => {
		if (nodeId) {
			removeNode(nodeId);
		}
		closeModal(ModalName.deleteWorkflowNode);
	}, [nodeId, removeNode, closeModal]);

	const handleCancel = useCallback(() => {
		closeModal(ModalName.deleteWorkflowNode);
	}, [closeModal]);

	return (
		<Modal hideCloseButton name={ModalName.deleteWorkflowNode}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
				<p>{t("content", { name: nodeName })}</p>
				<p className="mt-1">{t("warning")}</p>
				{connectedEdgesCount > 0 ? (
					<p className="mt-2">{t("connectionWarning", { count: connectedEdgesCount })}</p>
				) : null}
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button ariaLabel={t("cancel")} className="px-4 py-3" onClick={handleCancel} variant="outline">
					{t("cancel")}
				</Button>

				<Button ariaLabel={t("delete")} className="px-4 py-3" onClick={handleDelete} variant="filled">
					{t("delete")}
				</Button>
			</div>
		</Modal>
	);
};

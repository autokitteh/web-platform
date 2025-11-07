import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { TriggersService } from "@services";
import { useCacheStore, useModalStore, useToastStore } from "@src/store";

import { DeleteTriggerModal } from "@components/organisms/triggers/deleteModal";

export const TriggerDeleteView = () => {
	const { t: tTriggers } = useTranslation("tabs", { keyPrefix: "triggers" });
	const { projectId } = useParams();
	const { closeModal, getModalData } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchTriggers } = useCacheStore();

	const [isDeletingTrigger, setIsDeletingTrigger] = useState(false);

	const handleDeleteTrigger = async () => {
		const modalData = getModalData<string>(ModalName.deleteTrigger);
		if (!modalData || !projectId) return;

		setIsDeletingTrigger(true);
		const { error } = await TriggersService.delete(modalData);
		setIsDeletingTrigger(false);
		closeModal(ModalName.deleteTrigger);

		if (error) {
			return addToast({
				message: (error as Error).message,
				type: "error",
			});
		}

		addToast({
			message: tTriggers("triggerRemovedSuccessfully"),
			type: "success",
		});

		fetchTriggers(projectId, true);
	};

	const triggerId = getModalData<string>(ModalName.deleteTrigger);

	return <DeleteTriggerModal id={triggerId || ""} isDeleting={isDeletingTrigger} onDelete={handleDeleteTrigger} />;
};

import React, { useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { EditTrigger } from "./edit";
import { ModalName } from "@src/enums";
import { useModalStore } from "@src/store";

import { Modal } from "@components/molecules";

export const EditTriggerModal = () => {
	const navigate = useNavigate();
	const goBack = () => navigate(-1);
	const { openModal } = useModalStore();
	const { triggerId } = useParams();

	useEffect(() => {
		if (triggerId) {
			openModal(ModalName.editTrigger);
		}
	}, [openModal, triggerId]);

	return (
		<Modal
			className="relative bg-gray-1100 p-6"
			forceOpen
			hideCloseButton
			name={ModalName.editTrigger}
			onCloseCallbackOverride={goBack}
		>
			<EditTrigger />
		</Modal>
	);
};

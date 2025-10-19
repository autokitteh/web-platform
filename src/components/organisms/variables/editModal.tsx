import React, { useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { EditVariable } from "./edit";
import { ModalName } from "@src/enums";
import { useModalStore } from "@src/store";

import { Modal } from "@components/molecules";

export const EditVariableModal = () => {
	const navigate = useNavigate();
	const goBack = () => navigate(-1);
	const { openModal } = useModalStore();
	const { variableName } = useParams();

	useEffect(() => {
		if (variableName) {
			openModal(ModalName.editVariable);
		}
	}, [openModal, variableName]);

	return (
		<Modal
			className="relative bg-gray-1100 p-6"
			forceOpen
			hideCloseButton
			name={ModalName.editVariable}
			onCloseCallbackOverride={goBack}
		>
			<EditVariable />
		</Modal>
	);
};

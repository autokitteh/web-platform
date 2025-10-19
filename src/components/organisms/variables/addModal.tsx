import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { AddVariable } from "./add";
import { ModalName } from "@src/enums";
import { useModalStore } from "@src/store";

import { Modal } from "@components/molecules";

export const AddVariableModal = () => {
	const navigate = useNavigate();
	const goBack = () => navigate(-1);
	const { openModal } = useModalStore();

	useEffect(() => {
		openModal(ModalName.addVariable);
	}, [openModal]);

	return (
		<Modal
			className="relative bg-gray-1100 p-6"
			forceOpen
			hideCloseButton
			name={ModalName.addVariable}
			onCloseCallbackOverride={goBack}
		>
			<AddVariable />
		</Modal>
	);
};

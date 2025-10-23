import React, { useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { EditConnection } from "./edit";
import { ModalName } from "@src/enums";
import { useModalStore } from "@src/store";

import { Modal } from "@components/molecules";

export const EditConnectionModal = () => {
	const navigate = useNavigate();
	const goBack = () => navigate(-1);
	const { openModal } = useModalStore();
	const { connectionId } = useParams();
	useEffect(() => {
		if (connectionId) {
			openModal(ModalName.editConnection);
		}
	}, [openModal, connectionId]);
	return (
		<Modal
			className="relative bg-gray-1100 p-6"
			forceOpen
			hideCloseButton
			name={ModalName.editConnection}
			onCloseCallbackOverride={goBack}
		>
			<EditConnection />
		</Modal>
	);
};

import React, { useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { EditConnection } from "./edit";
import { ModalName } from "@src/enums";
import { useModalStore } from "@src/store";

import { Button, IconSvg } from "@components/atoms";
import { Modal } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const EditConnectionModal = () => {
	const navigate = useNavigate();
	const goBack = () => navigate(-1);
	const { openModal } = useModalStore();
	const { connectionId } = useParams();
	useEffect(() => {
		console.log(connectionId);
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
			<div className="absolute right-4 top-4 z-[1000]">
				<Button
					ariaLabel="Close Connection Edit Modal"
					className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
					id="close-connection-edit-modal-button"
					onClick={goBack}
				>
					<IconSvg className="fill-white" size="sm" src={Close} />
				</Button>
			</div>
			<EditConnection />
		</Modal>
	);
};

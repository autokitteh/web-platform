import React from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { useModalStore } from "@store";

export const ModalDeleteConnection = () => {
	const { closeModal } = useModalStore();
	const handleCloseModal = () => closeModal("deleteConnection");

	return (
		<Modal name="deleteConnection">
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">Delete Connection</h3>
				<p>
					This connection you are about to delete is used in <br />
					<strong>3 projects, 2 of them are currently running.</strong>
				</p>
				<br />
				<p>
					Deleting the connection may cause failure of projects. <br /> Are you sure you want to delete this connection?
				</p>
			</div>
			<div className="flex justify-end gap-1 mt-14">
				<Button className="font-semibold py-3 px-4 hover:text-white w-auto" onClick={handleCloseModal}>
					Cancel
				</Button>
				<Button className="font-semibold py-3 px-4 bg-gray-700 w-auto" onClick={handleCloseModal} variant="filled">
					Yes, delete
				</Button>
			</div>
		</Modal>
	);
};

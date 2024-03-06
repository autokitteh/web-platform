import React, { useState } from "react";
import { PlusCircle } from "@assets/image";
import { Button, Input } from "@components/atoms";
import { Modal } from "@components/molecules";

export const AddCodeAssetsTab = () => {
	const [isModal, setIsModal] = useState(false);
	const toggleModal = () => setIsModal(!isModal);

	return (
		<div className="h-full flex justify-center items-center">
			<Button className=" group flex flex-col items-center gap-2.5 cursor-pointer" onClick={toggleModal}>
				<PlusCircle className="transition stroke-gray-400 group-hover:stroke-green-accent" />
				<p className="text-center text-lg font-bold uppercase text-white">Add Code & Assets</p>
			</Button>
			<Modal isOpen={isModal} onClose={toggleModal}>
				<div className="mx-6">
					<h3 className="text-xl font-bold mb-5">Add New</h3>
					<form>
						<Input
							classInput="placeholder:text-gray-400 hover:placeholder:text-gray-800"
							className="bg-white border-gray-400 hover:border-gray-700"
							isRequired
							placeholder="Name"
						/>
						<Button className="font-bold justify-center mt-2 rounded-lg py-2.5" variant="filled">
							Create
						</Button>
					</form>
				</div>
			</Modal>
		</div>
	);
};

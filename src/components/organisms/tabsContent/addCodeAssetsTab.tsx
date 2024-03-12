import React, { useState } from "react";
import { PlusCircle } from "@assets/image";
import { Button, Toast } from "@components/atoms";
import { ModalAddCodeAssets } from "@components/organisms/modals";
import { ProjectsService } from "@services";
import { useModalStore, useCodeAssetsStore } from "@store";
import { cn } from "@utilities";
import { useParams } from "react-router-dom";

export const AddCodeAssetsTab = () => {
	const { projectId } = useParams();
	const { openModal } = useModalStore();
	const { setCodeAsset } = useCodeAssetsStore();
	const [isDragOver, setIsDragOver] = useState(false);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const styleCircle = cn("transition stroke-gray-400 group-hover:stroke-green-accent", {
		"stroke-green-accent": isDragOver,
	});

	const checkFileExtension = (file?: File): boolean => {
		if (!file) return false;

		const isValid = file.name.toLowerCase().endsWith(".py");
		if (!isValid) alert("Please select a file with the .py extension");

		return isValid;
	};

	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault();
		setIsDragOver(true);
	};

	const handleDrop = async (event: React.DragEvent<HTMLInputElement>) => {
		event.preventDefault();
		setIsDragOver(false);

		const droppedFile = event.dataTransfer.files[0];
		if (droppedFile) await handleFileUpload(droppedFile);
	};

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile) await handleFileUpload(selectedFile);
	};

	const handleFileUpload = async (file: File) => {
		if (!checkFileExtension(file)) return;

		const fileContent = await readFileAsUint8Array(file);
		const { error } = await ProjectsService.setResources(projectId as string, {
			[file.name]: fileContent,
		});

		if (error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}

		setCodeAsset(file);
	};

	const readFileAsUint8Array = (file: File): Promise<Uint8Array> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
			reader.onerror = () => reject(reader.error);

			reader.readAsArrayBuffer(file);
		});
	};

	return (
		<div className="flex flex-col h-full">
			<Button
				className="w-auto group gap-1 p-0 capitalize font-semibold text-gray-300 hover:text-white mt-14 ml-auto"
				onClick={() => openModal("addCodeAssets")}
			>
				<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
				Add new
			</Button>
			<div
				className="h-full flex justify-center items-center"
				onDragEnter={handleDragOver}
				onDragLeave={() => setIsDragOver(false)}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<div className="flex flex-col items-center gap-2.5">
					<label className="group flex flex-col items-center gap-2.5 cursor-pointer">
						<input accept=".py" className="hidden" onChange={handleFileSelect} type="file" />
						<PlusCircle className={styleCircle} />
						<p className="text-center text-lg font-bold uppercase text-white">Add Code & Assets</p>
					</label>
				</div>
				<ModalAddCodeAssets
					onError={(message) => setToast({ isOpen: true, message })}
					projectId={projectId as string}
				/>
				<Toast
					className="border-error"
					duration={10}
					isOpen={toast.isOpen}
					onClose={() => setToast({ ...toast, isOpen: false })}
				>
					<h5 className="font-semibold">Error</h5>
					<p className="mt-1 text-xs">{toast.message}</p>
				</Toast>
			</div>
		</div>
	);
};

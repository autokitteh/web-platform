import React, { useState } from "react";
import { PlusCircle } from "@assets/image";
import { ModalAddCodeAssets } from "@components/organisms/modals";
import { useModalStore } from "@store";
import { cn } from "@utilities";

export const AddCodeAssetsTab = () => {
	const { openModal } = useModalStore();
	const [isDragOver, setIsDragOver] = useState(false);
	const [file, setFile] = useState<File>();
	const styleCircle = cn("transition stroke-gray-400 group-hover:stroke-green-accent", {
		"stroke-green-accent": isDragOver,
	});

	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault();
		setIsDragOver(true);
	};

	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault();
		setIsDragOver(false);

		setFile(event.dataTransfer.files[0]);
		openModal("addCodeAssets");
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		const fileExtension = file?.name.split(".").pop()?.toLowerCase();
		if (fileExtension !== "py") {
			alert("Please select a file with the .py extension");
			return;
		}
		setFile(file);
		openModal("addCodeAssets");
	};

	return (
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
			<ModalAddCodeAssets file={file} />
		</div>
	);
};

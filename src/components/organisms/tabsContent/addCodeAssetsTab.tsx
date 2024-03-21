import React, { useState } from "react";
import { PlusCircle } from "@assets/image";
import { Button, TBody, THead, Table, Td, Th, Toast, Tr } from "@components/atoms";
import { ModalAddCodeAssets } from "@components/organisms/modals";
import { namespaces } from "@constants/namespaces.logger.constants";
import { EModalName } from "@enums/components";
import { LoggerService } from "@services/logger.service";
import { useModalStore, useProjectStore } from "@store";
import { cn } from "@utilities";
import { orderBy, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const AddCodeAssetsTab = () => {
	const { projectId } = useParams();
	const { t } = useTranslation("errors");
	const { openModal } = useModalStore();
	const { currentProject, setProjectResources } = useProjectStore();
	const [isDragOver, setIsDragOver] = useState(false);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const styleCircle = cn("transition stroke-gray-400 group-hover:stroke-green-accent", {
		"stroke-green-accent": isDragOver,
	});

	const resourcesEntries = Object.entries(currentProject.resources);
	const sortedResources = orderBy(resourcesEntries, ([name]) => name, "asc");

	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault();
		setIsDragOver(true);
	};

	const handleDrop = (event: React.DragEvent<HTMLInputElement>) => {
		event.preventDefault();
		setIsDragOver(false);

		const droppedFile = event.dataTransfer.files[0];
		if (droppedFile) fileUpload(droppedFile);
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile) fileUpload(selectedFile);
	};

	const fileUpload = async (file: File) => {
		const { error } = await setProjectResources(file);

		if (error) {
			setToast({ isOpen: true, message: t("projectAddFailed") });
			LoggerService.error(
				namespaces.projectUI,
				t("projectAddFailedExtended", { projectId: projectId, error: (error as Error).message })
			);
			return;
		}
	};

	return (
		<div className="flex flex-col h-full">
			<Button
				className="w-auto group gap-1 p-0 capitalize font-semibold text-gray-300 hover:text-white mt-14 ml-auto"
				onClick={() => openModal(EModalName.addCodeAssets)}
			>
				<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
				Add new
			</Button>
			{!isEmpty(sortedResources) ? (
				<Table className="mt-5 max-h-80">
					<THead>
						<Tr>
							<Th className="border-r-0 cursor-pointer group font-normal">Name</Th>
							<Th className="border-r-0 max-8" />
						</Tr>
					</THead>
					<TBody>
						{sortedResources.map(([name], idx) => (
							<Tr className="group" key={idx}>
								<Td className="font-semibold border-r-0">{name}</Td>
								<Th className="border-r-0 max-8" />
							</Tr>
						))}
					</TBody>
				</Table>
			) : null}

			<div
				className="mt-auto mb-auto flex justify-center items-center"
				onDragEnter={handleDragOver}
				onDragLeave={() => setIsDragOver(false)}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<div className="flex flex-col items-center gap-2.5">
					<label className="group flex flex-col items-center gap-2.5 cursor-pointer">
						<input accept=".py" className="hidden" multiple onChange={handleFileSelect} type="file" />
						<PlusCircle className={styleCircle} />
						<p className="text-center text-lg font-bold uppercase text-white">Add Code & Assets</p>
					</label>
				</div>
				<ModalAddCodeAssets onError={(message) => setToast({ isOpen: true, message })} />
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

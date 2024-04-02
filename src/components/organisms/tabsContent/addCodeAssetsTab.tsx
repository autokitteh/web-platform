import React, { useState } from "react";
import { PlusCircle } from "@assets/image";
import { Button, TBody, THead, Table, Td, Th, Toast, Tr } from "@components/atoms";
import { ModalAddCodeAssets } from "@components/organisms/modals";
import { namespaces } from "@constants";
import { EModalName } from "@enums/components";
import { LoggerService } from "@services";
import { useModalStore, useProjectStore } from "@store";
import { cn } from "@utilities";
import { orderBy, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const AddCodeAssetsTab = () => {
	const { projectId } = useParams();
	const { t } = useTranslation("errors");
	const { openModal } = useModalStore();
	const { currentProject, setProjectResources, updateActiveEditorFileName } = useProjectStore();
	const [isDragOver, setIsDragOver] = useState(false);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const resourcesEntries = Object.entries(currentProject.resources);
	const sortedResources = orderBy(resourcesEntries, ([name]) => name, "asc");

	const styleCircle = cn("transition stroke-gray-400 group-hover:stroke-green-accent", {
		"stroke-green-accent": isDragOver,
	});
	const styleBase = cn("transition rounded-xl relative flex-1", {
		"mt-auto mb-auto flex justify-center items-center": isEmpty(sortedResources),
	});
	const styleFrame = cn(
		"absolute transition top-0 h-full w-full rounded-lg z-50 flex justify-center items-center",
		"opacity-0 select-none pointer-events-none",
		{
			"bg-white/40 border-2 opacity-1": isDragOver,
			"opacity-1 pointer-events-auto": isEmpty(sortedResources),
		}
	);

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
				ariaLabel="Add new code file"
				className="w-auto group gap-1 p-0 capitalize font-semibold text-gray-300 hover:text-white mt-14 ml-auto"
				onClick={() => openModal(EModalName.addCodeAssets)}
			>
				<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
				Add new
			</Button>
			<div
				className={styleBase}
				onDragEnter={handleDragOver}
				onDragLeave={() => setIsDragOver(false)}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				{!isEmpty(sortedResources) ? (
					<Table className="max-h-96">
						<THead>
							<Tr>
								<Th className="border-r-0 cursor-pointer group font-normal">Name</Th>
								<Th className="border-r-0 max-8" />
							</Tr>
						</THead>
						<TBody>
							{sortedResources.map(([name], idx) => (
								<Tr className={cn({ "bg-black": name === currentProject.activeEditorFileName })} key={idx}>
									<Td
										className="font-semibold border-r-0 cursor-pointer"
										onClick={() => updateActiveEditorFileName(name)}
									>
										{name}
									</Td>
									<Th className="border-r-0 max-w-8" />
								</Tr>
							))}
						</TBody>
					</Table>
				) : null}
				<div className={styleFrame}>
					<div className="flex flex-col items-center gap-2.5">
						<label className="group flex flex-col items-center gap-2.5 cursor-pointer">
							<input accept=".py, .star" className="hidden" multiple onChange={handleFileSelect} type="file" />
							<PlusCircle className={styleCircle} />
							<p className="text-center text-lg font-bold uppercase text-white">Add Code & Assets</p>
						</label>
					</div>
				</div>
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
	);
};

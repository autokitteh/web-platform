import React, { useState } from "react";
import { PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";
import { Button, IconButton, TBody, THead, Table, Td, Th, Toast, Tr } from "@components/atoms";
import { ModalAddCodeAssets, ModalDeleteFile } from "@components/organisms/modals";
import { EModalName } from "@enums/components";
import { useModalStore, useProjectStore } from "@store";
import { cn } from "@utilities";
import { orderBy, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const AddCodeAssetsTab = () => {
	const { projectId } = useParams();
	const { t } = useTranslation(["errors", "buttons", "tables"]);
	const { openModal, closeModal } = useModalStore();
	const { currentProject, setProjectResources, updateEditorOpenedFiles, removeProjectFile } = useProjectStore();
	const [isDragOver, setIsDragOver] = useState(false);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const selectedRemoveFileName = useModalStore((state) => state.data as string);

	const resourcesEntries = Object.entries(currentProject.resources);
	const sortedResources = orderBy(resourcesEntries, ([name]) => name, "asc");

	const styleCircle = cn("transition stroke-gray-400 group-hover:stroke-green-accent", {
		"stroke-green-accent": isDragOver,
	});
	const styleBase = cn("transition rounded-xl relative flex-1", {
		"mt-auto mb-auto flex justify-center items-center": isEmpty(sortedResources),
	});
	const styleFrame = cn(
		"absolute transition top-0 h-full w-full rounded-lg z-10 flex justify-center items-center",
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

		const droppedFiles = Array.from(event.dataTransfer.files);
		if (droppedFiles) fileUpload(droppedFiles);
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = Array.from(event.target.files || []);
		if (selectedFile) fileUpload(selectedFile);
	};

	const fileUpload = async (files: File[]) => {
		const { error, fileName } = await setProjectResources(files);

		if (error) {
			setToast({ isOpen: true, message: t("fileAddFailedExtended", { projectId, fileName }) });
			return;
		}
	};

	const activeBodyRow = (fileName: string) =>
		cn({
			"bg-black": currentProject.openedFiles?.find(({ name, isActive }) => name === fileName && isActive),
		});

	const handleRemoveFile = async () => {
		closeModal(EModalName.deleteFile);
		const { error } = await removeProjectFile(selectedRemoveFileName);

		if (error) setToast({ isOpen: true, message: t("failedRemoveFile", { fileName: selectedRemoveFileName }) });
	};

	return (
		<div className="flex flex-col h-full">
			<div className="mb-5 mt-14 flex justify-end gap-6">
				{!isEmpty(sortedResources) ? (
					<label className="group flex gap-1 p-0 font-semibold text-gray-300 hover:text-white cursor-pointer">
						<input accept=".py, .star" className="hidden" multiple onChange={handleFileSelect} type="file" />
						<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
						{t("addNewFile", { ns: "buttons" })}
					</label>
				) : null}

				<Button
					ariaLabel={t("createNewFile", { ns: "buttons" })}
					className="w-auto group gap-1 p-0 font-semibold text-gray-300 hover:text-white"
					onClick={() => openModal(EModalName.addCodeAssets)}
				>
					<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
					{t("createNewFile", { ns: "buttons" })}
				</Button>
			</div>
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
								<Th className="border-r-0 cursor-pointer group font-normal">{t("name", { ns: "tables" })}</Th>
								<Th className="border-r-0 max-11" />
							</Tr>
						</THead>
						<TBody>
							{sortedResources.map(([name], idx) => (
								<Tr className={activeBodyRow(name)} key={idx}>
									<Td className="font-semibold border-r-0 cursor-pointer" onClick={() => updateEditorOpenedFiles(name)}>
										{name}
									</Td>
									<Th className="border-r-0 max-w-11">
										<IconButton onClick={() => openModal(EModalName.deleteFile, name)}>
											<TrashIcon className="fill-white w-3 h-3" />
										</IconButton>
									</Th>
								</Tr>
							))}
						</TBody>
					</Table>
				) : null}
				<div className={styleFrame}>
					<div className="flex flex-col items-center gap-2.5">
						<label
							className={cn(
								"group flex flex-col items-center gap-2.5 cursor-pointer",
								"text-center text-lg font-bold uppercase text-white"
							)}
						>
							<input accept=".py, .star" className="hidden" multiple onChange={handleFileSelect} type="file" />
							<PlusCircle className={styleCircle} />
							{t("addCodeAndAssets", { ns: "buttons" })}
						</label>
					</div>
				</div>
			</div>
			<ModalDeleteFile onDelete={handleRemoveFile} />
			<ModalAddCodeAssets onError={(message) => setToast({ isOpen: true, message })} />
			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={t("error")}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};

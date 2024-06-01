import React, { useState, useEffect } from "react";
import { PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";
import { Button, IconButton, TBody, THead, Table, Td, Th, Toast, Tr } from "@components/atoms";
import { ModalAddCodeAssets, ModalDeleteFile } from "@components/organisms/modals";
import { monacoLanguages } from "@constants";
import { ModalName } from "@enums/components";
import { ProjectsService } from "@services";
import { useModalStore, useProjectStore } from "@store";
import { cn } from "@utilities";
import { orderBy, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const AddCodeAssetsTab = () => {
	const [isLoading, setIsLoading] = useState(true);
	const { projectId } = useParams();
	const { t: tErrors } = useTranslation(["errors"]);
	const { t } = useTranslation("tabs", { keyPrefix: "code&assets" });
	const { openModal, closeModal } = useModalStore();
	const {
		currentProject: { openedFiles, resources },
		getProjectResources,
		setProjectResources,
		updateEditorOpenedFiles,
		removeProjectFile,
	} = useProjectStore();
	const [isDragOver, setIsDragOver] = useState(false);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const allowedExtensions = Object.keys(monacoLanguages).join(", ");
	const selectedRemoveFileName = useModalStore((state) => state.data as string);

	const resourcesEntries = Object.entries(resources);
	const sortedResources = orderBy(resourcesEntries, ([name]) => name, "asc");

	const styleCircle = cn("duration-300 stroke-gray-400 group-hover:stroke-green-accent", {
		"stroke-green-accent": isDragOver,
	});
	const styleBase = cn("duration-300 rounded-xl relative flex-1", {
		"mt-auto mb-auto flex justify-center items-center": isEmpty(sortedResources),
	});
	const styleFrame = cn(
		"absolute duration-300 top-0 h-full w-full rounded-lg z-10 flex justify-center items-center",
		"opacity-0 select-none pointer-events-none",
		{
			"bg-white/40 border-2 opacity-1": isDragOver,
			"opacity-1 pointer-events-auto": isEmpty(sortedResources),
		}
	);
	const activeBodyRow = (fileName: string) => {
		const isActiveFile = openedFiles?.find(({ name, isActive }) => name === fileName && isActive);
		return cn({
			"bg-black": isActiveFile,
		});
	};

	const fetchResources = async () => {
		setIsLoading(true);
		try {
			const { data: resources, error } = await ProjectsService.getResources(projectId!);
			if (error) throw error;
			if (!resources) return;

			getProjectResources(resources);
		} catch (err) {
			setToast({ isOpen: true, message: (err as Error).message });
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchResources();
	}, [projectId]);

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
		const { error, fileName } = await setProjectResources(files, projectId!);

		if (error) {
			setToast({ isOpen: true, message: tErrors("fileAddFailedExtended", { projectId, fileName }) });
			return;
		}
		fetchResources();
	};

	const handleRemoveFile = async () => {
		closeModal(ModalName.deleteFile);
		const { error } = await removeProjectFile(selectedRemoveFileName, projectId!);

		if (error) {
			setToast({ isOpen: true, message: tErrors("failedRemoveFile", { fileName: selectedRemoveFileName }) });
			return;
		}
		fetchResources();
	};

	return isLoading ? (
		<div className="flex flex-col justify-center h-full text-xl font-semibold text-center">
			{t("buttons.loading")}...
		</div>
	) : (
		<div className="flex flex-col h-full">
			<div className="flex justify-end gap-6 mb-5 mt-14">
				{!isEmpty(sortedResources) ? (
					<label className="flex gap-1 p-0 font-semibold text-gray-300 cursor-pointer group hover:text-white">
						<input accept={allowedExtensions} className="hidden" multiple onChange={handleFileSelect} type="file" />
						<PlusCircle className="w-5 h-5 duration-300 stroke-gray-300 group-hover:stroke-white" />
						{t("buttons.addNewFile")}
					</label>
				) : null}

				<Button
					ariaLabel={t("buttons.createNewFile")}
					className="w-auto gap-1 p-0 font-semibold text-gray-300 group hover:text-white"
					onClick={() => openModal(ModalName.addCodeAssets)}
				>
					<PlusCircle className="w-5 h-5 duration-300 stroke-gray-300 group-hover:stroke-white" />
					{t("buttons.createNewFile")}
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
								<Th className="font-normal border-r-0 cursor-pointer group">{t("table.columns.name")}</Th>
								<Th className="border-r-0 max-12" />
							</Tr>
						</THead>
						<TBody>
							{sortedResources.map(([name], idx) => (
								<Tr className={activeBodyRow(name)} key={idx}>
									<Td className="font-semibold border-r-0 cursor-pointer" onClick={() => updateEditorOpenedFiles(name)}>
										{name}
									</Td>
									<Td className="border-r-0 max-w-12">
										<IconButton onClick={() => openModal(ModalName.deleteFile, name)}>
											<TrashIcon className="w-3 h-3 fill-white" />
										</IconButton>
									</Td>
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
							<input accept={allowedExtensions} className="hidden" multiple onChange={handleFileSelect} type="file" />
							<PlusCircle className={styleCircle} />
							{t("buttons.addCodeAndAssets")}
						</label>
					</div>
				</div>
			</div>
			<ModalDeleteFile onDelete={handleRemoveFile} />
			<ModalAddCodeAssets onError={(message) => setToast({ isOpen: true, message })} onSuccess={fetchResources} />
			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={tErrors("error")}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};

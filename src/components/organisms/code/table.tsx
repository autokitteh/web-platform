import React, { useEffect, useState } from "react";

import { isEmpty, orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { fileSizeUploadLimit, monacoLanguages, namespaces } from "@constants";
import { ModalName } from "@enums/components";
import { LoggerService } from "@services";
import { cn } from "@utilities";

import { useFileOperations } from "@hooks";
import { useModalStore, useProjectValidationStore, useToastStore } from "@store";

import { Button, IconButton, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { AddFileModal, DeleteFileModal } from "@components/organisms/code";

import { PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";

export const CodeTable = () => {
	const [isLoading, setIsLoading] = useState(true);
	const { projectId } = useParams();
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "code&assets" });
	const { closeModal, openModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { checkState } = useProjectValidationStore();
	const {
		deleteFile,
		fetchFiles,
		fetchResources: fetchResourcesFromServer,
		openFileAsActive,
		openFiles,
		saveFile,
	} = useFileOperations(projectId!);

	const [resources, setResources] = useState<Record<string, Uint8Array>>({});
	const [isDragOver, setIsDragOver] = useState(false);

	const allowedExtensions = Object.keys(monacoLanguages).join(", ");
	const selectedRemoveFileName = useModalStore((state) => state.data as string);

	const styleCircle = cn("stroke-gray-750 duration-300 group-hover:stroke-green-800", {
		"stroke-green-800": isDragOver,
	});

	const fetchResources = async () => {
		setIsLoading(true);
		const resources = await fetchResourcesFromServer(true);
		if (resources) {
			checkState(projectId!, true);
		}
		setResources(resources);
		setIsLoading(false);
	};

	const getResources = async () => {
		setIsLoading(true);
		const resources = await fetchFiles();
		setResources(resources);
		setIsLoading(false);
	};

	useEffect(() => {
		fetchResources();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fileUpload = async (files: File[]) => {
		try {
			for (const file of files) {
				if (file.size > fileSizeUploadLimit) {
					addToast({
						message: tErrors("fileTooLarge"),
						type: "error",
					});
					LoggerService.error(
						namespaces.projectUICode,
						tErrors("fileTooLargeExtended", {
							fileName: file.name,
							maxSize: fileSizeUploadLimit / 1024 + "KB",
							projectId,
						})
					);

					return;
				}
				const fileContent = await file.text();
				await saveFile(file.name, fileContent);
			}
			fetchResources();
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			addToast({
				message: tErrors("fileAddFailed", { fileName: files[0]?.name }),
				type: "error",
			});
			LoggerService.error(
				namespaces.projectUICode,
				tErrors("fileAddFailedExtended", { fileName: files[0]?.name, projectId })
			);
		}
	};

	const activeBodyRow = (fileName: string) => {
		const isActiveFile = projectId
			? openFiles[projectId]?.find(({ isActive, name }) => name === fileName && isActive)
			: undefined;

		return cn({ "bg-black": isActiveFile });
	};

	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault();
		setIsDragOver(true);
	};

	const handleDrop = (event: React.DragEvent<HTMLInputElement>) => {
		event.preventDefault();
		setIsDragOver(false);
		const droppedFiles = Array.from(event.dataTransfer.files);
		if (droppedFiles) {
			fileUpload(droppedFiles);
		}
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = Array.from(event.target.files || []);
		if (selectedFile) {
			fileUpload(selectedFile);
		}
	};

	const handleRemoveFile = async () => {
		closeModal(ModalName.deleteFile);
		try {
			await deleteFile(selectedRemoveFileName);
			getResources();
			checkState(projectId!, true);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			addToast({
				message: tErrors("failedRemoveFile", { fileName: selectedRemoveFileName }),
				type: "error",
			});
		}
	};

	const handleTrashIconClick = (event: React.MouseEvent, name: string) => {
		event.stopPropagation();
		openModal(ModalName.deleteFile, name);
	};

	const resourcesEntries = Object.entries(resources);
	const sortedResources = orderBy(resourcesEntries, ([name]) => name, "asc");

	const styleBase = cn("relative flex-1 rounded-xl duration-300", {
		"mb-auto mt-auto flex items-center justify-center": isEmpty(sortedResources),
	});
	const styleFrame = cn(
		"absolute top-0 z-10 flex h-full w-full items-center justify-center rounded-lg duration-300",
		"pointer-events-none select-none opacity-0",
		{
			"opacity-1 border-2 bg-white/40": isDragOver,
			"opacity-1 pointer-events-auto": isEmpty(sortedResources),
		}
	);

	return isLoading ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="flex h-full flex-col">
			<div className="mb-2.5 flex justify-end gap-4">
				{!isEmpty(sortedResources) ? (
					<label className="group flex cursor-pointer gap-1 p-0 font-semibold text-gray-500 hover:text-white">
						<input
							accept={allowedExtensions}
							className="hidden"
							multiple
							onChange={handleFileSelect}
							type="file"
						/>

						<PlusCircle className="size-5 stroke-gray-500 duration-300 group-hover:stroke-white" />

						{t("buttons.addNewFile")}
					</label>
				) : null}

				<Button
					ariaLabel={t("buttons.createNewFile")}
					className="group w-auto gap-1 p-0 font-semibold text-gray-500 hover:text-white"
					onClick={() => openModal(ModalName.addCodeAssets)}
				>
					<PlusCircle className="size-5 stroke-gray-500 duration-300 group-hover:stroke-white" />

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
								<Th className="group cursor-pointer border-r-0 font-normal">
									{t("table.columns.name")}
								</Th>
							</Tr>
						</THead>

						<TBody>
							{sortedResources.map(([name], index) => (
								<Tr className={activeBodyRow(name)} key={index} onClick={() => openFileAsActive(name)}>
									<Td className="cursor-pointer font-medium">{name}</Td>

									<Td className="max-w-12 pr-0">
										<IconButton onClick={(event) => handleTrashIconClick(event, name)}>
											<TrashIcon className="size-3 fill-white" />
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
								"group flex cursor-pointer flex-col items-center gap-2.5",
								"text-center text-lg font-bold uppercase text-white"
							)}
						>
							<input
								accept={allowedExtensions}
								className="hidden"
								multiple
								onChange={handleFileSelect}
								type="file"
							/>

							<PlusCircle className={styleCircle} />

							{t("buttons.addCodeAndAssets")}
						</label>
					</div>
				</div>
			</div>

			<DeleteFileModal onDelete={handleRemoveFile} />

			<AddFileModal onSuccess={fetchResources} />
		</div>
	);
};

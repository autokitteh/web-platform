import React, { useState } from "react";

import { isEmpty, orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { fileSizeUploadLimit, monacoLanguages, namespaces } from "@constants";
import { ModalName } from "@enums/components";
import { LoggerService } from "@services";
import { fileOperations } from "@src/factories";
import { cn } from "@utilities";

import { useCacheStore, useFileStore, useModalStore, useToastStore } from "@store";

import { Button, IconButton, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { AddFileModal, DeleteFileModal } from "@components/organisms/code";

import { PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";

export const CodeTable = () => {
	const { projectId } = useParams();
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "code&assets" });
	const { closeModal, openModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const {
		fileList: { list },
		openFileAsActive,
		openFiles,
	} = useFileStore();
	const { saveFile, deleteFile } = fileOperations(projectId!);

	const {
		loading: { resourses: isLoading },
	} = useCacheStore();

	const [isDragOver, setIsDragOver] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const allowedExtensions = Object.keys(monacoLanguages).join(", ");
	const selectedRemoveFileName = useModalStore((state) => state.data as string);

	const styleCircle = cn("stroke-gray-750 duration-300 group-hover:stroke-green-800", {
		"stroke-green-800": isDragOver,
	});

	const fileUpload = async (files: File[]) => {
		try {
			let firstFileLoaded = true;

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

				if (firstFileLoaded) {
					openFileAsActive(file.name);
					firstFileLoaded = false;
				}
			}
		} catch (error) {
			addToast({
				message: tErrors("fileAddFailed", { fileName: files[0]?.name }),
				type: "error",
			});
			LoggerService.error(
				namespaces.projectUICode,
				tErrors("fileAddFailedExtended", { fileName: files[0]?.name, projectId, error: error.message })
			);
		}
	};

	const activeBodyRow = (fileName: string) => {
		const isActiveFile = projectId
			? openFiles[projectId]?.find(
					({ isActive, name }: { isActive: boolean; name: string }) => name === fileName && isActive
				)
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

		event.target.value = "";
	};

	const handleRemoveFile = async () => {
		try {
			setIsDeleting(true);
			await deleteFile(selectedRemoveFileName);
			setIsDeleting(false);
			closeModal(ModalName.deleteFile);
			addToast({
				message: t("successRemoveFile", { fileName: selectedRemoveFileName }),
				type: "success",
			});
			LoggerService.info(namespaces.ui.code, t("successRemoveFile", { fileName: selectedRemoveFileName }));

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

	const sortedResources = orderBy(list, (name) => name, "asc");

	const styleBase = cn("relative flex-1 rounded-xl duration-300", {
		"mb-auto mt-auto flex items-center justify-center": isEmpty(sortedResources),
	});
	const styleFrame = cn(
		"absolute top-0 z-10 flex size-full items-center justify-center rounded-lg duration-300",
		"pointer-events-none select-none opacity-0",
		{
			"opacity-1 border-2 bg-white/40": isDragOver,
			"opacity-1 pointer-events-auto": isEmpty(sortedResources),
		}
	);

	return isLoading && isEmpty(sortedResources) ? (
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
					<Table>
						<THead>
							<Tr>
								<Th className="group cursor-pointer border-r-0 pl-4 font-normal">
									{t("table.columns.name")}
								</Th>
							</Tr>
						</THead>

						<TBody>
							{sortedResources.map((name) => (
								<Tr className={activeBodyRow(name)} key={name} onClick={() => openFileAsActive(name)}>
									<Td className="cursor-pointer pl-4 font-medium">{name}</Td>

									<Td className="max-w-12 pr-4">
										<IconButton onClick={(event) => handleTrashIconClick(event, name)}>
											<TrashIcon className="size-4 stroke-white" />
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

			<DeleteFileModal isDeleting={isDeleting} onDelete={handleRemoveFile} />

			<AddFileModal />
		</div>
	);
};

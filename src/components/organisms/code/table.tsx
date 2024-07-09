import React, { useEffect, useState } from "react";

import { isEmpty, orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { monacoLanguages } from "@constants";
import { ModalName } from "@enums/components";
import { ProjectsService } from "@services";
import { cn } from "@utilities";

import { useModalStore, useProjectStore, useToastStore } from "@store";

import { Button, IconButton, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { AddFileModal, DeleteFileModal } from "@components/organisms/code";

import { PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";

export const CodeTable = () => {
	const [isLoading, setIsLoading] = useState(true);
	const { projectId } = useParams();
	const { t: tErrors } = useTranslation(["errors"]);
	const { t } = useTranslation("tabs", { keyPrefix: "code&assets" });
	const { closeModal, openModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);

	const {
		getProjectResources,
		openedFiles,
		removeProjectFile,
		resources,
		setProjectResources,
		updateEditorOpenedFiles,
	} = useProjectStore();
	const [isDragOver, setIsDragOver] = useState(false);

	const allowedExtensions = Object.keys(monacoLanguages).join(", ");
	const selectedRemoveFileName = useModalStore((state) => state.data as string);

	const resourcesEntries = Object.entries(resources);
	const sortedResources = orderBy(resourcesEntries, ([name]) => name, "asc");

	const styleCircle = cn("stroke-gray-400 duration-300 group-hover:stroke-green-accent", {
		"stroke-green-accent": isDragOver,
	});
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

	const fetchResources = async () => {
		setIsLoading(true);
		try {
			const { data: resources, error } = await ProjectsService.getResources(projectId!);
			if (error) {
				throw error;
			}
			if (!resources) {
				return;
			}

			getProjectResources(resources);
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const fileUpload = async (files: File[]) => {
		const { error, fileName } = await setProjectResources(files, projectId!);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("fileAddFailedExtended", { fileName, projectId }),
				type: "error",
			});

			return;
		}
		fetchResources();
	};

	const activeBodyRow = (fileName: string) => {
		const isActiveFile = openedFiles?.find(({ isActive, name }) => name === fileName && isActive);

		return cn({
			"bg-black": isActiveFile,
		});
	};

	useEffect(() => {
		fetchResources();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

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
		const { error } = await removeProjectFile(selectedRemoveFileName, projectId!);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("failedRemoveFile", { fileName: selectedRemoveFileName }),
				type: "error",
			});

			return;
		}
		fetchResources();
	};

	return isLoading ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="flex h-full flex-col">
			<div className="mb-3 flex justify-end gap-6">
				{!isEmpty(sortedResources) ? (
					<label className="group flex cursor-pointer gap-1 p-0 font-semibold text-gray-300 hover:text-white">
						<input
							accept={allowedExtensions}
							className="hidden"
							multiple
							onChange={handleFileSelect}
							type="file"
						/>

						<PlusCircle className="h-5 w-5 stroke-gray-300 duration-300 group-hover:stroke-white" />

						{t("buttons.addNewFile")}
					</label>
				) : null}

				<Button
					ariaLabel={t("buttons.createNewFile")}
					className="group w-auto gap-1 p-0 font-semibold text-gray-300 hover:text-white"
					onClick={() => openModal(ModalName.addCodeAssets)}
				>
					<PlusCircle className="h-5 w-5 stroke-gray-300 duration-300 group-hover:stroke-white" />

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
								<Tr className={activeBodyRow(name)} key={index}>
									<Td
										className="cursor-pointer font-medium"
										onClick={() => updateEditorOpenedFiles(name)}
									>
										{name}
									</Td>

									<Td className="max-w-12 pr-0">
										<IconButton onClick={() => openModal(ModalName.deleteFile, name)}>
											<TrashIcon className="h-3 w-3 fill-white" />
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

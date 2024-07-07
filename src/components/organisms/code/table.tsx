import React, { useEffect, useState } from "react";

import { PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";
import { Button, IconButton, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { AddFileModal, DeleteFileModal } from "@components/organisms/code";
import { monacoLanguages } from "@constants";
import { ModalName } from "@enums/components";
import { ProjectsService } from "@services";
import { useModalStore, useProjectStore, useToastStore } from "@store";
import { cn } from "@utilities";
import { isEmpty, orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

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
		<div className="flex flex-col h-full">
			<div className="flex gap-6 justify-end mb-3">
				{!isEmpty(sortedResources) ? (
					<label className="cursor-pointer flex font-semibold gap-1 group hover:text-white p-0 text-gray-300">
						<input
							accept={allowedExtensions}
							className="hidden"
							multiple
							onChange={handleFileSelect}
							type="file"
						/>

						<PlusCircle className="duration-300 group-hover:stroke-white h-5 stroke-gray-300 w-5" />

						{t("buttons.addNewFile")}
					</label>
				) : null}

				<Button
					ariaLabel={t("buttons.createNewFile")}
					className="font-semibold gap-1 group hover:text-white p-0 text-gray-300 w-auto"
					onClick={() => openModal(ModalName.addCodeAssets)}
				>
					<PlusCircle className="duration-300 group-hover:stroke-white h-5 stroke-gray-300 w-5" />

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
								<Th className="border-r-0 cursor-pointer font-normal group">
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
											<TrashIcon className="fill-white h-3 w-3" />
										</IconButton>
									</Td>
								</Tr>
							))}
						</TBody>
					</Table>
				) : null}

				<div className={styleFrame}>
					<div className="flex flex-col gap-2.5 items-center">
						<label
							className={cn(
								"group flex flex-col items-center gap-2.5 cursor-pointer",
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

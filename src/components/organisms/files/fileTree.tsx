import React, { useState } from "react";

import { Tree } from "react-arborist";

import { FileTreeProps, NodeProps } from "@interfaces/components";
import { ModalName } from "@src/enums";
import { useModalStore } from "@src/store";

import { Button, IconSvg } from "@components/atoms";

import { ChevronDownIcon, CirclePlusIcon, UploadIcon, TrashIcon } from "@assets/image/icons";
import { FileIcon } from "@assets/image/icons/sidebar";

const FileNode = ({ node, style, activeFilePath, onFileClick, onFileDelete }: NodeProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const isActive = !node.data.isFolder && activeFilePath === node.data.id;

	const handleClick = () => {
		if (node.data.isFolder) {
			node.toggle();
		} else {
			onFileClick(node.data.id);
		}
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onFileDelete(node.data.id);
	};

	return (
		<Button
			ariaLabel={`Open ${node.data.name}`}
			className={`group flex w-full items-center justify-between rounded-lg px-3 py-0 transition-all duration-200 ${
				isHovered ? "bg-gray-1100 text-gray-200" : "text-gray-400 hover:text-gray-200"
			}`}
			onClick={handleClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleClick();
				}
			}}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{ ...style }}
			type="button"
		>
			<div className="flex min-w-0 flex-1">
				{node.data.isFolder ? (
					<>
						<IconSvg
							className={` size-4 shrink-0 transition-transform duration-200 ${
								node.isOpen ? "rotate-0" : "-rotate-90"
							} ${isActive ? "fill-green-800" : "fill-gray-400 group-hover:fill-green-800"}`}
							src={ChevronDownIcon}
						/>
						<svg
							className={`size-4 shrink-0 ${isActive ? "fill-green-800" : "fill-green-500 group-hover:fill-green-800"}`}
							fill="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
						</svg>
					</>
				) : (
					<IconSvg
						className={`mr-2 size-4 shrink-0 ${isActive ? "stroke-green-800" : "text-gray-400"}`}
						src={FileIcon}
					/>
				)}
				<span
					className={`text-sm ${isActive ? "text-white" : "text-gray-400"} truncate`}
					title={node.data.name}
				>
					{node.data.name.length > 32 ? `${node.data.name.slice(0, 32)}...` : node.data.name}
				</span>
			</div>

			{!node.data.isFolder ? (
				<div
					className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded opacity-0 transition-all hover:bg-gray-1250 group-hover:opacity-100"
					onClick={handleDelete}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							handleDelete(e as any);
						}
					}}
					role="button"
					tabIndex={0}
					title={`Delete ${node.data.name}`}
				>
					<IconSvg className="size-4 stroke-gray-400 hover:stroke-red-500" src={TrashIcon} />
				</div>
			) : null}
		</Button>
	);
};

export const FileTree = ({
	data,
	activeFilePath,
	onFileClick,
	onFileDelete,
	height,
	isUploadingFiles,
	handleFileSelect,
}: FileTreeProps) => {
	const { openModal } = useModalStore();

	return (
		<>
			<div className="flex py-2">
				<Button
					ariaLabel="Create new file"
					className="group mr-4 !p-0 hover:bg-transparent hover:font-semibold"
					onClick={() => openModal(ModalName.addFile)}
				>
					<CirclePlusIcon className="size-4 stroke-green-800 stroke-[2] transition-all group-hover:stroke-[3]" />
					<span className="-ml-1 text-sm text-green-800 hover:underline">Create</span>
				</Button>
				<label
					aria-label="Import files"
					className="group flex cursor-pointer !p-0 hover:bg-transparent hover:font-semibold"
				>
					<input
						className="hidden"
						disabled={isUploadingFiles}
						multiple
						onChange={handleFileSelect}
						type="file"
					/>
					<UploadIcon className="size-4 stroke-green-800 stroke-[4] transition-all group-hover:stroke-[5]" />
					<span className="ml-1 text-sm text-green-800 hover:underline">Import</span>
				</label>
			</div>
			{data.length > 0 ? null : <p className="text-sm text-gray-300">No files available</p>}
			<Tree data={data} height={height} indent={12} openByDefault={false} rowHeight={25} width="100%">
				{(props) => (
					<FileNode
						{...props}
						activeFilePath={activeFilePath}
						onFileClick={onFileClick}
						onFileDelete={onFileDelete}
					/>
				)}
			</Tree>
		</>
	);
};

/***
							<div className="flex flex-col items-center justify-center gap-4 py-12">
								<p className="text-sm text-gray-500">No files available</p>
								<div className="flex gap-2">
									<Button
										ariaLabel="Create new file"
										className="group !p-0 hover:bg-transparent hover:font-semibold"
										onClick={() => openModal(ModalName.addFile)}
									>
										<CirclePlusIcon className="size-4 stroke-green-800 stroke-[1.225] transition-all group-hover:stroke-[2]" />
										<span className="text-sm text-green-800">Create</span>
									</Button>
									<label className="group flex cursor-pointer gap-1 p-0 text-green-800 hover:font-semibold hover:text-green-600">
										<input
											className="hidden"
											disabled={isUploadingFiles}
											multiple
											onChange={handleFileSelect}
											type="file"
										/>
										<UploadIcon className="size-4 stroke-green-800 stroke-[1.5] transition-all group-hover:stroke-[2]" />
										<span className="text-sm">Import</span>
									</label>
								</div>
							</div>
 */

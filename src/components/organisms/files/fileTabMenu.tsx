import React, { useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";

import { EventListenerName, ModalName } from "@src/enums";
import { useFileStore, useModalStore, useSharedBetweenProjectsStore } from "@src/store";

interface FileTabMenuProps {
	fileName: string;
	isOpen: boolean;
	onClose: () => void;
	position: { x: number; y: number };
	projectId: string;
}

export const FileTabMenu = ({ fileName, isOpen, onClose, position, projectId }: FileTabMenuProps) => {
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const menuRef = useRef<HTMLDivElement>(null);
	const { closeOpenedFile, openFiles } = useFileStore();
	const { openModal } = useModalStore();
	const { setIsProjectFilesVisible } = useSharedBetweenProjectsStore();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	const handleClose = () => {
		closeOpenedFile(fileName);
		onClose();
	};

	const handleCloseAll = () => {
		const projectFiles = openFiles[projectId] || [];
		projectFiles.forEach((file) => {
			closeOpenedFile(file.name);
		});
		onClose();
	};

	const handleRename = () => {
		openModal(ModalName.renameFile, fileName);
		onClose();
	};

	const handleRevealInTree = () => {
		setIsProjectFilesVisible(projectId, true);

		setTimeout(() => {
			const event = new CustomEvent(EventListenerName.revealFileInTree, {
				detail: { fileName },
			});
			window.dispatchEvent(event);
		}, 100);

		onClose();
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed z-modal-button min-w-[200px] rounded-md border border-gray-800 bg-gray-1100 py-1 shadow-lg"
			ref={menuRef}
			style={{
				left: `${position.x}px`,
				top: `${position.y}px`,
			}}
		>
			<button
				className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-1000 focus:bg-gray-1000 focus:outline-none"
				onClick={handleClose}
				type="button"
			>
				{t("contextMenu.close")}
			</button>
			<button
				className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-1000 focus:bg-gray-1000 focus:outline-none"
				onClick={handleCloseAll}
				type="button"
			>
				{t("contextMenu.closeAll")}
			</button>
			<div className="my-1 h-px bg-gray-800" />
			<button
				className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-1000 focus:bg-gray-1000 focus:outline-none"
				onClick={handleRename}
				type="button"
			>
				{t("contextMenu.rename")}
			</button>
			<button
				className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-1000 focus:bg-gray-1000 focus:outline-none"
				onClick={handleRevealInTree}
				type="button"
			>
				{t("contextMenu.revealInTree")}
			</button>
		</div>
	);
};

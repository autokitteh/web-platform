import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { DuplicateProjectModalProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { Button, ErrorMessage, Input, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DuplicateProjectModal = ({
	isLoading,
	error,
	onProjectNameChange,
	onSubmit,
}: DuplicateProjectModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "duplicateProject" });
	const { closeModal } = useModalStore();

	return (
		<Modal hideCloseButton name={ModalName.duplicateProject}>
			<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
			<div>
				<Input
					isError={!!error}
					label={t("projectName")}
					onChange={(e) => onProjectNameChange(e.target.value)}
					variant="light"
				/>
				{error ? <ErrorMessage className="relative mt-0.5">{error}</ErrorMessage> : null}

				<div className="mt-8 flex w-full justify-end gap-2">
					<Button
						ariaLabel={t("cancelButton")}
						className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
						onClick={() => closeModal(ModalName.duplicateProject)}
						variant="outline"
					>
						{t("cancelButton")}
					</Button>

					<Button
						ariaLabel={t("duplicateButton")}
						className="bg-gray-1100 px-4 py-3 font-semibold"
						disabled={isLoading}
						onClick={onSubmit}
						variant="filled"
					>
						{isLoading ? <Loader size="sm" /> : null}
						{t("duplicateButton")}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

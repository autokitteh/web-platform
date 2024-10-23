import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { CreateProjectModalProps } from "@interfaces/components";
import { useModalStore } from "@src/store";

import { Button, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const ProjectTemplateCreateModal = ({ isCreating, onCreate }: CreateProjectModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "createProjectWithTemplate" });
	const { closeModal } = useModalStore();

	return (
		<Modal hideCloseButton name={ModalName.templateCreateProject}>
			<div className="mx-6">
				<p>{t("projectName")}</p>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.templateCreateProject)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("deleteButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold hover:text-error"
					disabled={isCreating}
					onClick={onCreate}
					variant="filled"
				>
					{isCreating ? <Loader className="mr-2" size="sm" /> : null}
					{t("createButton")}
				</Button>
			</div>
		</Modal>
	);
};

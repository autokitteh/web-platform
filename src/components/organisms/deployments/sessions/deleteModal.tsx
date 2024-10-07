import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { ModalDeleteDeploymentSessionProps } from "@interfaces/components";
import { useModalStore } from "@src/store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteSessionModal = ({ onDelete }: ModalDeleteDeploymentSessionProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteDeploymentSession" });
	const { data } = useModalStore();

	return (
		<Modal name={ModalName.deleteDeploymentSession}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>

				<p>{t("content", { name: data as string })}</p>
			</div>

			<div className="flex w-full justify-end">
				<Button
					ariaLabel={t("deleteButton")}
					className="mt-8 bg-gray-1100 px-4 py-3 font-semibold"
					onClick={onDelete}
					variant="filled"
				>
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};

import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { ModalDeleteDeploymentProps } from "@interfaces/components";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteDeploymentModal = ({ deploymentId, onDelete }: ModalDeleteDeploymentProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteDeployment" });

	return (
		<Modal name={ModalName.deleteDeployment}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>

				<p>
					<p>{t("content", { name: deploymentId })}</p>
				</p>
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

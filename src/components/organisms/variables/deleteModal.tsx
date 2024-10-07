import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { ModalDeleteVariableProps } from "@interfaces/components";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteVariableModal = ({ onDelete, variable }: ModalDeleteVariableProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteVariable" });

	return (
		<Modal name={ModalName.deleteVariable}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>

				<p>
					<p>{t("content", { name: variable?.name })}</p>
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

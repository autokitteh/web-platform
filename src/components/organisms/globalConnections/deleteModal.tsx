import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { DeleteModalProps } from "@interfaces/components";

import { useModalStore, useGlobalConnectionsStore } from "@store";

import { Button, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteConnectionModal = ({ id, isDeleting, onDelete }: DeleteModalProps) => {
	const { t } = useTranslation("connections", { keyPrefix: "deleteModal" });
	const { closeModal } = useModalStore();
	const { connections } = useGlobalConnectionsStore();
	const connectionName = connections.find((c) => c.connectionId === id)?.name;

	return (
		<Modal hideCloseButton name={ModalName.deleteConnection}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
				<p>{t("content", { name: connectionName || id })}</p>
				<p className="mt-2 text-sm text-gray-1100">{t("deleteWarning")}</p>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.deleteConnection)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("okButton")}
					className="min-w-20 justify-center bg-gray-1100 px-4 py-3 font-semibold hover:text-error"
					disabled={isDeleting}
					onClick={onDelete}
					variant="filled"
				>
					{isDeleting ? (
						<div className="flex flex-row gap-2">
							<Loader size="sm" />
							{t("okButton")}
						</div>
					) : (
						t("okButton")
					)}
				</Button>
			</div>
		</Modal>
	);
};

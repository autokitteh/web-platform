import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { DeleteModalProps } from "@interfaces/components";
import { ConnectionService } from "@services";
import { Connection } from "@type/models";

import { useModalStore, useToastStore } from "@store";

import { Button, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteConnectionModal = ({ id, isDeleting, onDelete }: DeleteModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteConnection" });
	const [connection, setConnection] = useState<Connection>();
	const addToast = useToastStore((state) => state.addToast);
	const { closeModal } = useModalStore();

	const fetchConnection = async () => {
		if (!id) {
			return;
		}
		const { data, error } = await ConnectionService.get(id);
		if (error) {
			addToast({
				message: t("fetchFailed"),
				type: "error",
			});

			return;
		}

		setConnection(data);
	};

	useEffect(() => {
		fetchConnection();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	return (
		<Modal hideCloseButton name={ModalName.deleteConnection}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
				<p>{t("content", { name: connection?.name })}</p>

				<p>{t("deleteWarning")}</p>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.deleteFile)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("deleteButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold hover:text-error"
					onClick={onDelete}
					variant="filled"
				>
					{isDeleting ? <Loader size="sm" /> : t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};

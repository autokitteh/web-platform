import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { ModalDeleteConnectionProps } from "@interfaces/components";
import { ConnectionService } from "@services";
import { Connection } from "@type/models";

import { useToastStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteConnectionModal = ({ connectionId, onDelete }: ModalDeleteConnectionProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteConnection" });
	const [connection, setConnection] = useState<Connection>();
	const addToast = useToastStore((state) => state.addToast);

	const fetchConnection = async () => {
		if (!connectionId) {
			return;
		}
		const { data, error } = await ConnectionService.get(connectionId);
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
	}, [connectionId]);

	return (
		<Modal name={ModalName.deleteConnection}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
				<p>{t("content", { name: connection?.name })}</p>
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

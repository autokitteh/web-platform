import React, { useEffect, useState } from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { ModalName } from "@enums/components";
import { ModalDeleteConnectionProps } from "@interfaces/components";
import { ConnectionService } from "@services";
import { useModalStore } from "@store";
import { Connection } from "@type/models";
import { Trans, useTranslation } from "react-i18next";

export const ModalDeleteConnection = ({ onDelete, connectionId }: ModalDeleteConnectionProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteConnection" });
	const { closeModal } = useModalStore();
	const [connection, setConnection] = useState<Connection>();

	const fetchConnection = async () => {
		if (!connectionId) return;
		const { data } = await ConnectionService.get(connectionId);
		if (!data) return;
		setConnection(data);
	};

	useEffect(() => {
		fetchConnection();
	}, [connectionId]);

	return (
		<Modal name={ModalName.deleteConnection}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title", { name: connection?.name })}</h3>
				<p>{t("line")}</p>
				<p className="font-medium">
					<Trans>
						{t("line2", {
							name: `<strong>${connection?.name}</strong><br/>`,
							appName: `<strong>${connection?.integrationName}</strong><br/>`,
						})}
					</Trans>
				</p>
				<p className="mt-1">{t("line3")}</p>
				<p className="mt-1">{t("line4")}</p>
			</div>
			<div className="flex justify-end gap-1 mt-14">
				<Button
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					onClick={() => closeModal(ModalName.deleteConnection)}
				>
					{t("cancelButton")}
				</Button>
				<Button className="w-auto px-4 py-3 font-semibold bg-gray-700" onClick={onDelete} variant="filled">
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};

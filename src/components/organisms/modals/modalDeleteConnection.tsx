import React, { useEffect, useState } from "react";
import { Button, Spinner } from "@components/atoms";
import { Modal } from "@components/molecules";
import { ModalName } from "@enums/components";
import { ModalDeleteConnectionProps } from "@interfaces/components";
import { ConnectionService } from "@services";
import { useModalStore } from "@store";
import { Connection } from "@type/models";
import { Trans, useTranslation } from "react-i18next";

export const ModalDeleteConnection = ({ onDelete, connectionId, loading }: ModalDeleteConnectionProps) => {
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
				<div className="font-medium">
					<Trans i18nKey="line2" t={t} values={{ name: connection?.name, appName: connection?.integrationName }} />
				</div>

				<p className="mt-1">{t("line3")}</p>
				<p className="mt-1">{t("line4")}</p>
			</div>
			<div className="flex justify-end gap-1 mt-14">
				<Button
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					disabled={loading}
					onClick={() => closeModal(ModalName.deleteConnection)}
				>
					{t("cancelButton")}
				</Button>
				<Button
					className="w-auto px-4 py-3 font-semibold bg-gray-700"
					disabled={loading}
					onClick={onDelete}
					variant="filled"
				>
					{loading ? <Spinner /> : null} {t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};

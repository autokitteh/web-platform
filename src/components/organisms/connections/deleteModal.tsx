import React, { useEffect, useState } from "react";

import { Trans, useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { ModalDeleteConnectionProps } from "@interfaces/components";
import { ConnectionService } from "@services";
import { useModalStore } from "@store";
import { Connection } from "@type/models";

import { Button, Spinner } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteConnectionModal = ({ connectionId, loading, onDelete }: ModalDeleteConnectionProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteConnection" });
	const { closeModal } = useModalStore();
	const [connection, setConnection] = useState<Connection>();

	const fetchConnection = async () => {
		if (!connectionId) {
			return;
		}
		const { data } = await ConnectionService.get(connectionId);
		if (!data) {
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
				<h3 className="mb-5 text-xl font-bold">{t("title", { name: connection?.name })}</h3>

				<p>{t("line")}</p>

				<div className="font-medium">
					<Trans
						i18nKey="line2"
						t={t}
						values={{ appName: connection?.integrationName, name: connection?.name }}
					/>
				</div>

				<p className="mt-1">{t("line3")}</p>

				<p className="mt-1">{t("line4")}</p>
			</div>

			<div className="mt-14 flex justify-end gap-1">
				<Button
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					disabled={loading}
					onClick={() => closeModal(ModalName.deleteConnection)}
				>
					{t("cancelButton")}
				</Button>

				<Button
					className="w-auto bg-gray-700 px-4 py-3 font-semibold"
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

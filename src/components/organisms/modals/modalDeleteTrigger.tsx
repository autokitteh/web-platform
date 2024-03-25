import React, { useEffect, useState } from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { EModalName } from "@enums/components";
import { IModalDeleteTrigger } from "@interfaces/components";
import { TriggersService } from "@services";
import { useModalStore } from "@store";
import { Trigger } from "@type/models";
import { useTranslation } from "react-i18next";

export const ModalDeleteTrigger = ({ onDelete }: IModalDeleteTrigger) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteTrigger" });
	const { closeModal, itemId } = useModalStore();
	const [trigger, setTrigger] = useState<Trigger>();

	useEffect(() => {
		if (itemId) {
			const fetchTrigger = async () => {
				const { data } = await TriggersService.get(itemId);
				if (!data) return;

				setTrigger(data);
			};
			fetchTrigger();
		}
	}, [itemId]);

	return (
		<Modal name={EModalName.deleteTrigger}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">{t("title")}</h3>
				<p>This trigger you are about to delete uses:</p>
				<p className="font-semibold">
					{t("line", {
						connection: trigger?.connectionName,
						entrypoint: `${trigger?.path}:${trigger?.name}`,
						eventType: trigger?.eventType,
					})}
				</p>
				<p className="mt-1">{t("line2")}</p>
				<p className="mt-1">{t("line3")}</p>
			</div>
			<div className="flex justify-end gap-1 mt-14">
				<Button
					className="font-semibold py-3 px-4 hover:text-white w-auto"
					onClick={() => closeModal(EModalName.deleteTrigger)}
				>
					{t("cancelButton")}
				</Button>
				<Button className="font-semibold py-3 px-4 bg-gray-700 w-auto" onClick={onDelete} variant="filled">
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};

import React, { useEffect, useState } from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { ModalName } from "@enums/components";
import { ModalDeleteTriggerProps } from "@interfaces/components";
import { TriggersService } from "@services";
import { useModalStore } from "@store";
import { Trigger } from "@type/models";
import { useTranslation, Trans } from "react-i18next";

export const DeleteTriggerModal = ({ onDelete, triggerId }: ModalDeleteTriggerProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteTrigger" });
	const { closeModal } = useModalStore();
	const [trigger, setTrigger] = useState<Trigger>();

	const fetchTrigger = async () => {
		if (!triggerId) return;
		const { data } = await TriggersService.get(triggerId);
		if (!data) return;
		setTrigger(data);
	};

	useEffect(() => {
		fetchTrigger();
	}, [triggerId]);

	return (
		<Modal name={ModalName.deleteTrigger}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title", { name: trigger?.name })}</h3>
				<p>{t("line")}</p>
				<div className="font-medium">
					<Trans
						i18nKey="line2"
						t={t}
						values={{
							connection: trigger?.connectionName,
							call: `${trigger?.path}:${trigger?.entryFunction}`,
							eventType: trigger?.eventType,
						}}
					/>
				</div>
				<p className="mt-1">{t("line3")}</p>
				<p className="mt-1">{t("line4")}</p>
			</div>
			<div className="flex justify-end gap-1 mt-14">
				<Button
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					onClick={() => closeModal(ModalName.deleteTrigger)}
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

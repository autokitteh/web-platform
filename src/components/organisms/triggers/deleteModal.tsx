import React, { useEffect, useState } from "react";

import { Trans, useTranslation } from "react-i18next";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { ModalName } from "@enums/components";
import { ModalDeleteTriggerProps } from "@interfaces/components";
import { TriggersService } from "@services";
import { useModalStore } from "@store";
import { Trigger } from "@type/models";

export const DeleteTriggerModal = ({ onDelete, triggerId }: ModalDeleteTriggerProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteTrigger" });
	const { closeModal } = useModalStore();
	const [trigger, setTrigger] = useState<Trigger>();

	const fetchTrigger = async () => {
		if (!triggerId) {
			return;
		}
		const { data } = await TriggersService.get(triggerId);
		if (!data) {
			return;
		}
		setTrigger(data);
	};

	useEffect(() => {
		fetchTrigger();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [triggerId]);

	return (
		<Modal name={ModalName.deleteTrigger}>
			<div className="mx-6">
				<h3 className="font-bold mb-5 text-xl">{t("title", { name: trigger?.name })}</h3>

				<p>{t("line")}</p>

				<div className="font-medium">
					<Trans
						i18nKey="line2"
						t={t}
						values={{
							call: `${trigger?.path}:${trigger?.entryFunction}`,
							connection: trigger?.connectionName,
							eventType: trigger?.eventType,
						}}
					/>
				</div>

				<p className="mt-1">{t("line3")}</p>

				<p className="mt-1">{t("line4")}</p>
			</div>

			<div className="flex gap-1 justify-end mt-14">
				<Button
					className="font-semibold hover:text-white px-4 py-3 w-auto"
					onClick={() => closeModal(ModalName.deleteTrigger)}
				>
					{t("cancelButton")}
				</Button>

				<Button className="bg-gray-700 font-semibold px-4 py-3 w-auto" onClick={onDelete} variant="filled">
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};

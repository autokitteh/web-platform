import React, { useEffect, useState } from "react";

import { Trans, useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { ModalDeleteTriggerProps } from "@interfaces/components";
import { TriggersService } from "@services";
import { Trigger } from "@type/models";

import { useModalStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

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
				<h3 className="mb-5 text-xl font-bold">{t("title", { name: trigger?.name })}</h3>

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

			<div className="mt-14 flex justify-end gap-1">
				<Button
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					onClick={() => closeModal(ModalName.deleteTrigger)}
				>
					{t("cancelButton")}
				</Button>

				<Button className="w-auto bg-gray-700 px-4 py-3 font-semibold" onClick={onDelete} variant="filled">
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};

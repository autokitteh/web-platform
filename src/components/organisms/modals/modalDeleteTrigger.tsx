import React, { useEffect, useState } from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { EModalName } from "@enums/components";
import { IModalDeleteTrigger } from "@interfaces/components";
import { TriggersService } from "@services";
import { useModalStore } from "@store";
import { Trigger } from "@type/models";
import { useTranslation, Trans } from "react-i18next";

export const ModalDeleteTrigger = ({ onDelete }: IModalDeleteTrigger) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteTrigger" });
	const { closeModal } = useModalStore();
	const dataTrigger = useModalStore((state) => state.data as Pick<Trigger, "triggerId">);
	const [trigger, setTrigger] = useState<Trigger>();
	useEffect(() => {
		if (dataTrigger && dataTrigger.triggerId) {
			const fetchTrigger = async () => {
				const { data } = await TriggersService.get(dataTrigger.triggerId!);
				if (!data) return;

				setTrigger(data);
			};
			fetchTrigger();
		}
	}, [dataTrigger]);

	return (
		<Modal name={EModalName.deleteTrigger}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">{t("title")}</h3>
				<p>{t("line")}</p>
				<p className="font-medium">
					<Trans>
						{t("line2", {
							connection: `<strong>${trigger?.connectionName}</strong><br/>`,
							entrypoint: `<strong>${trigger?.path}:${trigger?.name}</strong><br/>`,
							eventType: `<strong>${trigger?.eventType}</strong><br/>`,
						})}
					</Trans>
				</p>
				<p className="mt-1">{t("line3")}</p>
				<p className="mt-1">{t("line4")}</p>
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

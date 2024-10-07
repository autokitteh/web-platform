import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { ModalDeleteTriggerProps } from "@interfaces/components";
import { TriggersService } from "@services";
import { Trigger } from "@type/models";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteTriggerModal = ({ onDelete, triggerId }: ModalDeleteTriggerProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteTrigger" });
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
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
				<p>{t("content", { name: trigger?.name })}</p>
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

import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { DeleteModalProps } from "@interfaces/components";
import { TriggersService } from "@services";
import { useProjectData } from "@src/contexts/ProjectDataContext";
import { useModalStore } from "@src/store";
import { Trigger } from "@type/models";

import { Button, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteTriggerModal = ({ id, isDeleting, onDelete }: DeleteModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteTrigger" });
	const { t: tWarning } = useTranslation("modals", { keyPrefix: "warningActiveDeployment" });
	const [trigger, setTrigger] = useState<Trigger>();
	const { closeModal } = useModalStore();
	const { hasActiveDeployments } = useProjectData();

	const fetchTrigger = async () => {
		if (!id) {
			return;
		}
		const { data } = await TriggersService.get(id);
		if (!data) {
			return;
		}
		setTrigger(data);
	};

	useEffect(() => {
		fetchTrigger();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	return (
		<Modal hideCloseButton name={ModalName.deleteTrigger}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
				<p>{t("content", { name: trigger?.name })}</p>
				<p className="mt-1">{t("deleteWarning")}</p>
				{hasActiveDeployments ? <p className="mt-1 font-normal">{tWarning("content")}</p> : null}
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.deleteTrigger)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("deleteButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold hover:text-error"
					disabled={isDeleting}
					onClick={onDelete}
					variant="filled"
				>
					{isDeleting ? (
						<div className="flex flex-row gap-2">
							<Loader size="sm" />
							{t("deleteButton")}
						</div>
					) : (
						t("deleteButton")
					)}
				</Button>
			</div>
		</Modal>
	);
};

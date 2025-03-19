import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { DeploymentsService, EventsService } from "@services";
import { DeploymentStateVariant } from "@src/enums";

import { useModalStore, useProjectStore, useToastStore } from "@store";

import { Button, Input, Loader } from "@components/atoms";
import { Select, Modal } from "@components/molecules";

export const RedispatchEventModal = ({ eventId }: { eventId: string }) => {
	const { t } = useTranslation("modals", { keyPrefix: "redispatchEvent" });
	const { t: tEvents } = useTranslation("events");
	const { closeModal } = useModalStore();
	const { projectsList } = useProjectStore();
	const [activeDeployment, setActiveDeployment] = useState<string>();
	const addToast = useToastStore((state) => state.addToast);
	const [redispatchLoading, setRedispatchLoading] = useState(false);

	const projectOptions = projectsList.map((project) => ({
		label: project.name,
		value: project.id,
	}));

	const [selectedProject, setSelectedProject] = useState(projectOptions[0]);

	useEffect(() => {
		const fetchDeployments = async () => {
			const { data: deployments } = await DeploymentsService.list(selectedProject.value);
			deployments?.forEach((deployment) => {
				if (deployment.state === DeploymentStateVariant.active) {
					setActiveDeployment(deployment.deploymentId);
				}
			});
		};
		fetchDeployments();
	}, [selectedProject]);

	const handleRedispatch = useCallback(
		async () => {
			if (!activeDeployment) return;

			try {
				setRedispatchLoading(true);
				const response = await EventsService.redispatch(eventId, activeDeployment);
				if (response.error) {
					throw new Error();
				}
				addToast({
					message: tEvents("table.redispatchSuccess"),
					type: "success",
				});
			} catch {
				addToast({
					message: tEvents("table.redispatchFailed"),
					type: "error",
				});
			} finally {
				setRedispatchLoading(false);
				closeModal(ModalName.redispatchEvent);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[eventId, activeDeployment]
	);

	return (
		<Modal hideCloseButton name={ModalName.redispatchEvent}>
			<div className="mx-6">
				<h3 className="mb-2 text-xl font-bold">{t("title")}</h3>
				<p>{t("desc")}</p>
				<div className="mt-3">
					<Select
						label="Project Name"
						onChange={(option) => {
							if (option) {
								setSelectedProject(option);
							}
						}}
						options={projectOptions}
						value={selectedProject}
						variant="light"
					/>
				</div>
				<div className="mt-2">
					<Input disabled label="Depoyment ID" value={activeDeployment} variant="light" />
				</div>
			</div>
			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.redispatchEvent)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("redispatchButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold hover:text-error"
					disabled={redispatchLoading}
					onClick={handleRedispatch}
					variant="filled"
				>
					{redispatchLoading ? <Loader size="sm" /> : null}
					{t("redispatchButton")}
				</Button>
			</div>
		</Modal>
	);
};

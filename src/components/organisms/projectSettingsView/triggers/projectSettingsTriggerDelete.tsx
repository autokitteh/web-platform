import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { TriggersService } from "@services";
import { useHasActiveDeployments } from "@src/store";
import { Trigger } from "@type/models";

import { Button, IconSvg, Loader } from "@components/atoms";
import { ActiveDeploymentWarning } from "@components/molecules";

import { ArrowLeft } from "@assets/image/icons";

interface ProjectSettingsTriggerDeleteProps {
	triggerId: string;
	onBack: () => void;
	onDelete: () => void;
	isDeleting?: boolean;
}

export const ProjectSettingsTriggerDelete = ({
	triggerId,
	onBack,
	onDelete,
	isDeleting = false,
}: ProjectSettingsTriggerDeleteProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteTrigger" });
	const { t: tWarning } = useTranslation("modals", { keyPrefix: "warningActiveDeployment" });
	const [trigger, setTrigger] = useState<Trigger>();
	const hasActiveDeployments = useHasActiveDeployments();

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
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button
						ariaLabel="Back to Settings"
						className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
						onClick={onBack}
					>
						<IconSvg className="fill-white" src={ArrowLeft} />
					</Button>
					<h2 className="text-2xl font-semibold text-white">{t("title")}</h2>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<p>{t("content", { name: trigger?.name })}</p>
				<p className="mt-1">{t("deleteWarning")}</p>
				{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}
				{hasActiveDeployments ? <p className="mt-1 font-normal">{tWarning("content")}</p> : null}
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={onBack}
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
		</div>
	);
};

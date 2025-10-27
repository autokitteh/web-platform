import React from "react";

import { useTranslation } from "react-i18next";

import { Button, IconSvg } from "@components/atoms";
import { ActiveDeploymentWarning } from "@components/molecules";

import { ArrowLeft } from "@assets/image/icons";

interface ProjectSettingsTriggerEditProps {
	triggerId: string;
	onBack: () => void;
}

export const ProjectSettingsTriggerEdit = ({ triggerId, onBack }: ProjectSettingsTriggerEditProps) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tButtons } = useTranslation("buttons");
	const hasActiveDeployments = false; // This would come from props or hook

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
					<h2 className="text-2xl font-semibold text-white">{t("modifyTrigger")}</h2>
				</div>
			</div>

			{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}

			<div className="flex flex-col gap-4">
				<p className="text-gray-400">Trigger edit functionality will be implemented here.</p>
				<p className="text-gray-400">This is a placeholder for the full trigger edit form.</p>
				<p className="text-gray-400">Trigger ID: {triggerId}</p>
			</div>

			<div className="flex w-full justify-end gap-2">
				<Button
					ariaLabel={tButtons("cancel")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={onBack}
					variant="outline"
				>
					{tButtons("cancel")}
				</Button>

				<Button ariaLabel={tButtons("save")} className="px-4 py-3 font-semibold" disabled variant="filled">
					{tButtons("save")}
				</Button>
			</div>
		</div>
	);
};

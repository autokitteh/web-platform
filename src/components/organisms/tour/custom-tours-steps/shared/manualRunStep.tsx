import React from "react";

import { Trans, useTranslation } from "react-i18next";

import { ProjectActions } from "@src/enums";
import { useProjectStore } from "@src/store";

import { Typography, IconSvg, Loader } from "@components/atoms";

import { GearIcon } from "@assets/image/icons";

export const ManualRunStep = () => {
	const { t } = useTranslation("tour");
	const { actionInProcess } = useProjectStore();

	return (
		<div className="flex w-full flex-col gap-6">
			<div className="flex-1">
				{actionInProcess[ProjectActions.deploy] ? (
					<div className="flex h-full flex-col justify-center">
						<Typography className="font-semibold text-white" element="h4" size="xl">
							{t("quickstart.steps.manualRunButton.title")}{" "}
							<Loader className="top-1 ml-3 inline" size="md" />
						</Typography>

						<Typography className="mt-1 text-gray-300" element="p" size="small">
							{t("quickstart.steps.manualRunButtonLoading.content")}
						</Typography>
					</div>
				) : (
					<>
						<Typography className="font-semibold text-white" element="h4" size="xl">
							{t("quickstart.steps.manualRunButton.title")}
						</Typography>
						<Typography className="mt-1 text-gray-300" element="p" size="small">
							<Trans
								components={{
									GearIcon: (
										<IconSvg
											className="mx-0.5 inline fill-white stroke-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
											size="sm"
											src={GearIcon}
										/>
									),
								}}
								i18nKey="quickstart.steps.manualRunButton.content"
								ns="tour"
								t={t}
							/>
						</Typography>
					</>
				)}
			</div>
		</div>
	);
};

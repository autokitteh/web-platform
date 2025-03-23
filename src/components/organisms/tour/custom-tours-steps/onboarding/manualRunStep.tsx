import React from "react";

import { Trans, useTranslation } from "react-i18next";

import { Typography, IconSvg } from "@components/atoms";

import { GearIcon } from "@assets/image/icons";

export const ManualRunStep = () => {
	const { t } = useTranslation("tour");
	return (
		<div className="flex w-full flex-col gap-6">
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<Typography className="font-semibold text-white" element="h4" size="xl">
						{t("onboarding.steps.manualRunButton.title")}
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
							i18nKey="onboarding.steps.manualRunButton.content"
							ns="tour"
							t={t}
						/>
					</Typography>
				</div>
			</div>
		</div>
	);
};

import React from "react";

import { useTranslation } from "react-i18next";

import { Typography } from "@components/atoms";

export const CodeSettingsStep = () => {
	const { t } = useTranslation("tour");

	return (
		<div className="flex w-full flex-col gap-6">
			<div className="flex w-full items-center justify-between">
				<div className="w-full flex-1">
					<Typography className="font-semibold text-white" element="h4" size="large">
						{t("onboarding.steps.projectSettings.title")}
					</Typography>
					<Typography className="mt-1 text-gray-300" element="p" size="small">
						{t("onboarding.steps.projectSettings.content")}

						<div
							className="dot absolute left-[-30vw] z-10 sm:left-[-25vw] md:left-[-20vw] lg:left-[-17vw] lg:top-[-26.5vh]"
							style={
								{
									transform: "rotate(90deg) scaleX(-1) scaleY(-1)",
									"--c": "#BCF870",
									width: "15vw",
									height: "32vh",
									"--r": "6.5px",
								} as React.CSSProperties
							}
						/>
					</Typography>
				</div>
			</div>

			<div className="h-px w-full bg-gray-700" />

			<div className="flex items-center justify-between">
				<div className="flex-1">
					<Typography className="font-semibold text-white" element="h4" size="xl">
						{t("onboarding.steps.projectCode.title")}
					</Typography>
					<Typography className="mt-1 text-gray-300" element="p" size="small">
						{t("onboarding.steps.projectCode.content")}

						<div
							className="dot absolute right-[-20vw] z-10 sm:right-[-25vw] md:right-[-20vw] lg:right-[-6vw] lg:top-[4vh]"
							style={
								{
									transform: "rotate(90deg) scaleX(-1)",
									"--c": "#BCF870",
									width: "6vw",
									height: "8vh",
									"--r": "7px",
								} as React.CSSProperties
							}
						/>
					</Typography>
				</div>
			</div>
		</div>
	);
};

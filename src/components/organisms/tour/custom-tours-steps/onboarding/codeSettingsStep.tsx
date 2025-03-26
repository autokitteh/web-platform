import React from "react";

import { useTranslation } from "react-i18next";

import { Typography, DashedArrow } from "@components/atoms";

export const CodeSettingsStep = () => {
	const { t } = useTranslation("tour");

	return (
		<div className="flex w-full flex-col gap-6">
			<div className="flex w-full items-center justify-between">
				<div className="relative w-full flex-1">
					<Typography className="font-semibold text-white" element="h4" size="large">
						{t("onboarding.steps.projectSettings.title")}
					</Typography>
					<Typography className="mt-1 text-gray-300" element="p" size="small">
						{t("onboarding.steps.projectSettings.content")}
						<DashedArrow
							className="absolute z-10"
							style={
								{
									position: "absolute",
									top: "calc(-26.5vh)",
									left: "-21rem",
									transform: "rotate(90deg) scaleX(-1) scaleY(-1)",
									"--c": "#BCF870",
									width: "13vw",
									height: "36vh",
									"--r": "7px",
									"--s": "7px",
									"@media (max-width: 640px)": {
										left: "calc(-30vw + 2rem)",
										top: "calc(-28vh)",
										width: "15vw",
										height: "38vh",
									},
									"@media (max-width: 768px)": {
										left: "calc(-25vw + 1rem)",
										top: "calc(-27vh)",
										width: "14vw",
										height: "37vh",
									},
									"@media (max-width: 1024px)": {
										left: "calc(-20vw + 1rem)",
										top: "calc(-26.5vh)",
										width: "13vw",
										height: "36vh",
									},
									"@media (min-width: 1025px) and (max-width: 1440px)": {
										left: "calc(-18rem)",
										top: "calc(-25vh)",
										width: "12vw",
										height: "35vh",
									},
									"@media (min-width: 1441px) and (max-width: 1920px)": {
										left: "calc(-20rem)",
										top: "calc(-24vh)",
										width: "11vw",
										height: "34vh",
									},
									"@media (min-width: 1921px)": {
										left: "calc(-22rem)",
										top: "calc(-22vh)",
										width: "10vw",
										height: "32vh",
									},
								} as React.CSSProperties
							}
						/>
					</Typography>
				</div>
			</div>

			<div className="h-px w-full bg-gray-700" />

			<div className="flex items-center justify-between">
				<div className="relative flex-1">
					<Typography className="font-semibold text-white" element="h4" size="xl">
						{t("onboarding.steps.projectCode.title")}
					</Typography>
					<Typography className="mt-1 text-gray-300" element="p" size="small">
						{t("onboarding.steps.projectCode.content")}

						<DashedArrow
							className="absolute z-10"
							style={
								{
									position: "absolute",
									top: "calc(-4vh)",
									right: "-7vw",
									transform: "rotate(90deg) scaleX(-1)",
									"--c": "#BCF870",
									width: "6vw",
									height: "8vh",
									"--r": "7px",
									"--s": "7px",
									"@media (max-width: 640px)": {
										right: "calc(-20vw + 2rem)",
										top: "calc(-6vh)",
										width: "8vw",
										height: "10vh",
									},
									"@media (max-width: 768px)": {
										right: "calc(-25vw + 1rem)",
										top: "calc(-5vh)",
										width: "7vw",
										height: "9vh",
									},
									"@media (max-width: 1024px)": {
										right: "calc(-20vw + 1rem)",
										top: "calc(-4vh)",
										width: "6vw",
										height: "8vh",
									},
									"@media (min-width: 1025px) and (max-width: 1440px)": {
										right: "calc(-6vw)",
										top: "calc(-3.5vh)",
										width: "5.5vw",
										height: "7.5vh",
									},
									"@media (min-width: 1441px) and (max-width: 1920px)": {
										right: "calc(-6.5vw)",
										top: "calc(-3vh)",
										width: "5vw",
										height: "7vh",
									},
									"@media (min-width: 1921px)": {
										right: "calc(-5vw)",
										top: "calc(-2.5vh)",
										width: "4.5vw",
										height: "6.5vh",
									},
								} as React.CSSProperties
							}
						/>
					</Typography>
				</div>
			</div>
		</div>
	);
};

import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useSearchParams, Navigate } from "react-router-dom";

import { howToBuildAutomation, whatIsAutoKitteh } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useModalStore, useTemplatesStore } from "@src/store";

import { Button, Typography, Frame } from "@components/atoms";
import { TemplateStart } from "@components/organisms";
import { WelcomeVideoModal } from "@components/organisms/dashboard";

export const TemplateLanding = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const { openModal } = useModalStore();
	const { fetchTemplates } = useTemplatesStore();
	const [searchParams] = useSearchParams();
	const assetDir = searchParams.get("template-name");

	useEffect(() => {
		fetchTemplates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleOpenModal = (video: string) => {
		openModal(ModalName.welcomePage, { video });
	};

	if (!assetDir) return <Navigate replace to="/" />;

	return (
		<Frame className="mt-1.5 h-full bg-gray-1100">
			<TemplateStart assetDir={assetDir} />
			<div className="mt-8 flex justify-center gap-5 font-averta">
				<div>
					<Typography className="text-3xl font-bold" element="h2">
						{t("whatIsAutoKitteh")}
					</Typography>
					<ol className="mt-4 grid gap-1">
						{whatIsAutoKitteh.map((item, index) => (
							<li className="text-base" key={index}>
								{item}
							</li>
						))}
					</ol>
				</div>
				<div>
					<Typography className="text-3xl font-bold" element="h2">
						{t("howToBuildAnAutomation")}
					</Typography>
					<ol className="mt-4 grid gap-1">
						{howToBuildAutomation.map((item, index) => (
							<li className="text-base" key={index}>
								{item}
							</li>
						))}
					</ol>
					<Button
						className="p-0 text-base text-green-800 hover:bg-transparent"
						onClick={() => handleOpenModal("https://www.youtube.com/embed/BkUvIJc_kms")}
						variant="light"
					>
						{t("tutorialVideo")}
					</Button>
				</div>
			</div>

			<WelcomeVideoModal />
		</Frame>
	);
};

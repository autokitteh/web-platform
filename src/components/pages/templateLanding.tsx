import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { howToBuildAutomation, meowWorldProjectName, whatIsAutoKitteh } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useModalStore, useTemplatesStore } from "@src/store";

import { Button, IconButton, IconSvg, Spinner, Typography, Frame } from "@components/atoms";
import { WelcomeVideoModal } from "@components/organisms/dashboard";

import { ProjectsIcon } from "@assets/image";
import { CirclePlayIcon } from "@assets/image/icons";

export const TemplateLanding = () => {
	const { t: tWelcome } = useTranslation("dashboard", { keyPrefix: "topbar" });
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const { openModal } = useModalStore();
	const { createProjectFromAsset, isCreating } = useCreateProjectFromTemplate();
	const { fetchTemplates } = useTemplatesStore();

	useEffect(() => {
		fetchTemplates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleOpenModal = (video: string) => {
		openModal(ModalName.welcomePage, { video });
	};
	return (
		<Frame className="mt-1.5 h-full bg-gray-1100">
			<Typography
				className="mb-8 w-full text-center font-averta text-2xl font-semibold md:mb-0 md:text-left md:text-2xl"
				element="h1"
			>
				{tWelcome("welcome")}
			</Typography>
			<div className="flex flex-col items-center gap-3 border-b border-gray-950 pb-6 font-averta text-white">
				<div className="flex h-40 w-full flex-col md:w-96">
					<div className="flex w-full flex-1 items-center justify-center rounded-2xl border border-gray-750 bg-[url('image/pages/intro/main.jpg')] bg-cover bg-top bg-no-repeat">
						<IconButton
							className="group size-16 overflow-hidden rounded-full bg-black/75 shadow-sm shadow-green-800 hover:bg-black hover:shadow-none focus:scale-90"
							onClick={() => handleOpenModal("https://www.youtube.com/embed/BkUvIJc_kms")}
						>
							<CirclePlayIcon className="rounded-full fill-white transition group-hover:opacity-100" />
						</IconButton>
					</div>
				</div>
				<div className="flex flex-col font-averta">
					<Typography className="text-center text-2xl font-bold md:text-left" element="h2">
						{t("cards.main.reliableAutomation")}
					</Typography>

					<Typography className="text-center text-2xl font-bold text-green-800 md:text-left" element="h2">
						{t("cards.main.inAFewLinesOfCode")}
					</Typography>
					<Button
						ariaLabel={t("cards.main.meowWorld")}
						className="mt-2 w-52 justify-center gap-3 rounded-full bg-green-800 py-2 font-averta text-2xl font-bold leading-tight hover:bg-green-200"
						onClick={() => createProjectFromAsset(meowWorldProjectName)}
					>
						<IconSvg size="lg" src={!isCreating ? ProjectsIcon : Spinner} />
						{t("cards.main.meowWorld")}
					</Button>
				</div>
			</div>
			<div className="mt-8 flex flex-wrap justify-center gap-5 font-averta">
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

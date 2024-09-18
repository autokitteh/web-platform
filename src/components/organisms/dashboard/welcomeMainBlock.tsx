/* eslint-disable @liferay/empty-line-between-elements */
import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@src/enums/components";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useModalStore } from "@src/store";

import { Button, IconButton, IconSvg, Link, Spinner, Typography } from "@components/atoms";
import { WelcomeInfoCard, WelcomeVideoModal } from "@components/organisms/dashboard";

import { ProjectsIcon, StartFromTemplateImage } from "@assets/image";
import { ArrowStartTemplateIcon, CirclePlayIcon } from "@assets/image/icons";

export const DashboardWelcomeMainBlock = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const { openModal } = useModalStore();
	const { createProjectFromTemplate } = useCreateProjectFromTemplate();
	const [creatingTemplate, setCreatingTemplate] = useState(false);

	const handleOpenModal = (video: string) => {
		openModal(ModalName.welcomePage, { video });
	};

	const createProjectFromAsset = async (assetDirectory: string) => {
		setCreatingTemplate(true);
		await createProjectFromTemplate(assetDirectory);
		setCreatingTemplate(false);
	};

	return (
		<div className="z-10 mt-7 grid select-none gap-5">
			<div className="col-span-1 grid grid-cols-auto-fit-350 items-stretch gap-4 overflow-visible rounded-2xl border border-gray-950 bg-black p-8 pl-6 pr-4 font-averta text-white">
				<div className="flex flex-col">
					<div className="flex min-h-64 w-full flex-1 items-center justify-center rounded-2xl border-2 border-gray-750 bg-gray-1400">
						<IconButton
							className="group h-20 w-20 overflow-hidden rounded-full p-0 focus:scale-90"
							onClick={() => handleOpenModal("https://www.youtube.com/embed/QWSa0etwTDE")}
						>
							<CirclePlayIcon className="rounded-full transition group-hover:fill-white" />
						</IconButton>
					</div>

					<Typography className="mt-2 font-bold" element="p">
						{t("cards.main.buildAnything")}
					</Typography>
				</div>

				<div className="m-auto mt-2 w-full">
					<Typography className="text-center text-3xl font-bold 2xl:text-left" element="h2">
						{t("cards.main.reliableAutomation")}
					</Typography>

					<Typography className="text-center text-3xl font-bold 2xl:text-right" element="h2">
						{t("cards.main.inAFewLinesOfCode")}
					</Typography>

					<div className="mt-10">
						<div className="flex flex-col items-center justify-center gap-1">
							<Typography className="font-semibold text-gray-500" element="p">
								{t("cards.main.startWithDemoProject")}
							</Typography>

							<Button
								ariaLabel={t("cards.main.meowWorld")}
								className="min-w-64 justify-center gap-3 rounded-full bg-green-800 py-3 font-averta text-2xl font-bold leading-tight hover:bg-green-200"
								onClick={() => createProjectFromAsset("quickstart")}
							>
								<IconSvg size="lg" src={!creatingTemplate ? ProjectsIcon : Spinner} />
								{t("cards.main.meowWorld")}
							</Button>
						</div>

						<div className="relative left-1/2 mt-2 inline-block -translate-x-1/2">
							<StartFromTemplateImage className="m-auto" />

							<ArrowStartTemplateIcon className="absolute -top-4 left-52" />
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-auto-fit-350 gap-5">
				<WelcomeInfoCard
					items={[
						{
							text: t("cards.startingProject.developPythonCode"),
							linkText: t("cards.startingProject.docs"),
							linkHref: "#",
						},
						{
							text: t("cards.startingProject.configure"),
							linkText: t("cards.startingProject.connectionsToApplications"),
							linkHref: "#",
						},
						{
							text: t("cards.startingProject.configure"),
							linkText: t("cards.startingProject.triggers"),
							linkHref: "#",
						},
						{ text: t("cards.startingProject.setVarsOptional") },
					]}
					onPlay={() => handleOpenModal("https://www.youtube.com/embed/QWSa0etwTDE")}
					title={
						<Typography className="text-xl font-bold" element="h3">
							{t("cards.startingProject.startingAProject")}{" "}
							<Link className="font-normal text-green-800" to="#">
								{t("cards.startingProject.docs")}
							</Link>
						</Typography>
					}
				/>

				<WelcomeInfoCard
					items={[
						{ text: t("cards.developInVSCode.synchronizationWithServer") },
						{ text: t("cards.developInVSCode.quickActions") },
						{ text: t("cards.developInVSCode.devTools") },
						{ text: t("cards.developInVSCode.autocomplete") },
					]}
					onPlay={() => handleOpenModal("https://www.youtube.com/embed/QWSa0etwTDE")}
					title={
						<Typography className="text-xl font-bold" element="h3">
							{t("cards.developInVSCode.developInVSCode")}{" "}
							<Link className="font-normal text-green-800" to="#">
								{t("cards.developInVSCode.usingVSCodeExtension")}
							</Link>
						</Typography>
					}
				/>
			</div>
			<WelcomeVideoModal />
		</div>
	);
};

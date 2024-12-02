import React from "react";

import { useTranslation } from "react-i18next";

import { meowWorldProjectName } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useModalStore } from "@src/store";

import { Button, IconButton, IconSvg, Link, Spinner, Typography } from "@components/atoms";
import { WelcomeVideoCard, WelcomeVideoModal } from "@components/organisms/dashboard";

import { OrStartFromTemplateImage, ProjectsIcon } from "@assets/image";
import { ArrowStartTemplateIcon, CirclePlayIcon } from "@assets/image/icons";
import { DiscordIcon } from "@assets/image/icons/connections";

export const DashboardWelcomeMainBlock = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const { openModal } = useModalStore();
	const { createProjectFromAsset, isCreating } = useCreateProjectFromTemplate();

	const handleOpenModal = (video: string) => {
		openModal(ModalName.welcomePage, { video });
	};

	return (
		<div className="z-10 mt-7 grid h-2/3 select-none gap-5">
			<div className="col-span-1 grid grid-cols-auto-fit-350 items-stretch gap-4 overflow-visible rounded-2xl border border-gray-950 bg-black p-8 pl-6 pr-4 font-averta text-white">
				<div className="flex min-h-52 flex-col">
					<div className="flex w-full flex-1 items-center justify-center rounded-2xl border-2 border-gray-750 bg-[#1d2226] bg-[url('image/pages/intro/main.jpg')] bg-contain bg-center bg-no-repeat">
						<IconButton
							className="group size-20 overflow-hidden rounded-full bg-black/75 shadow-sm shadow-green-800 hover:bg-black hover:shadow-none focus:scale-90"
							onClick={() => handleOpenModal("https://www.youtube.com/embed/BkUvIJc_kms")}
						>
							<CirclePlayIcon className="rounded-full fill-white transition group-hover:opacity-100" />
						</IconButton>
					</div>

					<Typography className="mt-4 font-bold 2xl:hidden" element="p">
						{t("cards.main.buildAnything")}
					</Typography>
				</div>

				<div className="flex w-full flex-col justify-center">
					<div className="mx-auto w-4/5">
						<Typography className="text-3xl font-bold" element="h2">
							{t("cards.main.reliableAutomation")}
						</Typography>

						<Typography className="text-3xl font-bold" element="h2">
							{t("cards.main.inAFewLinesOfCode")}
						</Typography>

						<Typography className="mt-6 hidden font-bold 2xl:block" element="p">
							{t("cards.main.buildAnything")}
						</Typography>
					</div>
					<div className="mt-10">
						<div className="flex flex-col items-center justify-center gap-1">
							<Typography className="font-semibold text-gray-500" element="p">
								{t("cards.main.startWithDemoProject")}
							</Typography>

							<Button
								ariaLabel={t("cards.main.meowWorld")}
								className="min-w-64 justify-center gap-3 rounded-full bg-green-800 py-3 font-averta text-2xl font-bold leading-tight hover:bg-green-200"
								onClick={() => createProjectFromAsset(meowWorldProjectName)}
							>
								<IconSvg size="lg" src={!isCreating ? ProjectsIcon : Spinner} />
								{t("cards.main.meowWorld")}
							</Button>
						</div>

						<div className="relative left-1/2 mt-2 inline-block w-full -translate-x-1/2 2xl:w-auto">
							<OrStartFromTemplateImage className="m-auto" />

							<ArrowStartTemplateIcon className="absolute -bottom-8 left-auto right-0 top-auto 2xl:-top-4 2xl:left-52" />
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-auto-fit-350 gap-5">
				<WelcomeVideoCard
					description="Develop Python code"
					onPlay={() => handleOpenModal("https://www.youtube.com/embed/zNtJ8OBPUmY")}
					title="Hello World lorem ipsum title"
				/>
			</div>

			<div className="rounded-xl border border-gray-950 bg-gray-1250 py-2 pl-6 pr-4 font-averta">
				<Typography className="flex h-full flex-row items-center justify-center text-lg" element="p">
					{t("cards.footer.haveAQuestion")}
					<Link
						className="flex flex-row items-center gap-0.5 hover:text-green-200"
						target="_blank"
						to="https://discord.gg/UhnJuBarZQ"
					>
						<IconSvg className="ml-2 mr-1" size="lg" src={DiscordIcon} />{" "}
						<div className="underline">{t("cards.footer.joinDiscord")}</div>
					</Link>
				</Typography>
			</div>
			<WelcomeVideoModal />
		</div>
	);
};

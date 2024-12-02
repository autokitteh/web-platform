import React from "react";

import { useTranslation } from "react-i18next";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { meowWorldProjectName } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useModalStore, useProjectStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, IconButton, IconSvg, Link, Spinner, Typography } from "@components/atoms";
import { WelcomeVideoCard, WelcomeVideoModal } from "@components/organisms/dashboard";

import { InJustA, OrStartFromTemplateImage, ProjectsIcon, StartFromTemplateImage } from "@assets/image";
import {
	ArrowRightCarouselIcon,
	ArrowStartTemplateIcon,
	CirclePlayIcon,
	GithubIntroIcon,
	LinkedInIntroIcon,
	RedditIntroIcon,
	TelegramIntroIcon,
} from "@assets/image/icons";

import "swiper/css";
import "swiper/css/navigation";

export const IntroMainBlock = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const { openModal } = useModalStore();
	const { createProjectFromAsset, isCreating } = useCreateProjectFromTemplate();

	const { projectsList } = useProjectStore();

	const meowWorldExist = projectsList.find((project) => project.name === meowWorldProjectName);

	const handleOpenModal = (video: string) => {
		openModal(ModalName.welcomePage, { video });
	};

	const whatIsAutoKitteh = [
		"Durable workflow automation platform",
		"Simple to use APIs to applications",
		"Simple authentication",
		"Run Python code",
		"Workflow management",
	];

	const swiperButtonClass =
		"absolute z-10 flex size-9 top-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black transition hover:bg-gray-1000 active:scale-90";

	return (
		<div className="z-10 mt-7 select-none">
			<div className="grid grid-cols-auto-fit-248 items-stretch gap-x-14 gap-y-4 border-b border-gray-950 pb-7.5 font-averta text-white md:grid-cols-auto-fit-350">
				<div className="flex min-h-52 flex-col">
					<div className="flex min-h-64 w-full flex-1 items-center justify-center rounded-2xl border border-gray-750 bg-[url('image/pages/intro/main.jpg')] bg-cover bg-top bg-no-repeat">
						<IconButton
							className="group size-20 overflow-hidden rounded-full bg-black/75 shadow-sm shadow-green-800 hover:bg-black hover:shadow-none focus:scale-90"
							onClick={() => handleOpenModal("https://www.youtube.com/embed/BkUvIJc_kms")}
						>
							<CirclePlayIcon className="rounded-full fill-white transition group-hover:opacity-100" />
						</IconButton>
					</div>
				</div>

				<div className="flex w-full flex-col justify-center font-averta">
					<Typography className="text-center text-3xl font-bold md:text-left" element="h2">
						{t("cards.main.reliableAutomation")}
					</Typography>

					<Typography className="text-center text-3xl font-bold text-green-800 md:text-left" element="h2">
						<InJustA className="ml-5 inline-block" /> {t("cards.main.inAFewLinesOfCode")}
					</Typography>
					<div className="mt-10 hidden md:block">
						<div className="flex flex-wrap items-center justify-center gap-1">
							{meowWorldExist ? null : (
								<Button
									ariaLabel={t("cards.main.meowWorld")}
									className="min-w-52 justify-center gap-3 rounded-full bg-green-800 py-3 font-averta text-2xl font-bold leading-tight hover:bg-green-200"
									onClick={() => createProjectFromAsset(meowWorldProjectName)}
								>
									<IconSvg size="lg" src={!isCreating ? ProjectsIcon : Spinner} />
									{t("cards.main.meowWorld")}
								</Button>
							)}
							<div className="relative">
								{meowWorldExist ? (
									<>
										<StartFromTemplateImage />
										<ArrowStartTemplateIcon className="absolute -right-28 bottom-3" />
									</>
								) : (
									<>
										<OrStartFromTemplateImage className="m-auto" />

										<ArrowStartTemplateIcon className="absolute -right-10 bottom-3" />
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="mt-8 grid grid-cols-auto-fit-248 gap-x-14 gap-y-5 border-b border-gray-950 pb-7.5 font-averta md:grid-cols-auto-fit-350">
				<div className="border-gray-950 md:border-r">
					<Typography className="pr-4 text-3xl font-bold text-green-800" element="h2">
						{t("getStarted")}
					</Typography>
					<div className="scrollbar mt-5 flex max-h-280 flex-col gap-7 overflow-auto md:mt-9">
						{Array(6)
							.fill(null)
							.map((_, index) => (
								<WelcomeVideoCard
									description="Develop Python code"
									key={index}
									onPlay={() => handleOpenModal("https://www.youtube.com/embed/zNtJ8OBPUmY")}
									title="Hello World lorem ipsum title"
								/>
							))}
					</div>
				</div>
				<div>
					<Typography className="text-3xl font-bold" element="h2">
						{t("whatIsAutoKitteh")}
					</Typography>
					<ol className="mt-6 grid gap-1">
						{whatIsAutoKitteh.map((item, index) => (
							<li className="text-base" key={index}>
								{item}
							</li>
						))}
					</ol>
				</div>
			</div>
			<div className="mt-8 grid grid-cols-auto-fit-248 gap-x-14 gap-y-6 font-averta md:grid-cols-auto-fit-350">
				<div className="border-gray-950 md:border-r">
					<Typography className="pr-4 text-lg font-bold uppercase" element="h3">
						{t("joinTheCommunity")}
					</Typography>
					<Typography className="mt-2 text-base" element="p">
						{t("seeOurCommunity")}
					</Typography>
					<div className="mt-4 flex gap-2.5">
						<Link target="_blank" to="https://www.reddit.com/r/autokitteh">
							<RedditIntroIcon className="fill-gray-500 transition hover:fill-green-800" />
						</Link>
						<Link target="_blank" to="https://www.linkedin.com/company/autokitteh">
							<LinkedInIntroIcon className="fill-gray-500 transition hover:fill-green-800" />
						</Link>
						<Link target="_blank" to="https://discord.gg/UhnJuBarZQ">
							<TelegramIntroIcon className="fill-gray-500 transition hover:fill-green-800" />
						</Link>
						<Link target="_blank" to="https://github.com/autokitteh/autokitteh">
							<GithubIntroIcon className="fill-gray-500 transition hover:fill-green-800" />
						</Link>
					</div>
				</div>
				<div className="relative pb-5 md:pb-0">
					<Typography className="mb-3 pr-4 text-lg font-bold uppercase" element="h3">
						{t("news")}
					</Typography>
					<Swiper
						breakpoints={{
							768: {
								slidesPerView: 2,
							},
						}}
						className="ml-5 mr-10 md:ml-0"
						modules={[Navigation]}
						navigation={{
							nextEl: ".swiper-next",
							prevEl: ".swiper-prev",
						}}
						spaceBetween={35}
					>
						{Array(3)
							.fill(null)
							.map((_, index) => (
								<SwiperSlide key={index}>
									<Link className="text-base" target="_blank" to="#">
										Build anything with simple code. Use APIs and build your business logic:
										Serverless, no queues, secured, managed
									</Link>
									<Typography
										className="mt-5 text-xs font-semibold uppercase text-gray-750"
										element="p"
									>
										1 week ago
									</Typography>
								</SwiperSlide>
							))}
					</Swiper>
					<div className={cn(swiperButtonClass, "md:-left-12 -left-6 swiper-prev")}>
						<ArrowRightCarouselIcon className="rotate-180" />
					</div>
					<div className={cn(swiperButtonClass, "-right-1 swiper-next")}>
						<ArrowRightCarouselIcon />
					</div>
				</div>
			</div>

			<WelcomeVideoModal />
		</div>
	);
};

import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import {
	getStartedWithAutoKitteh,
	howToBuildAutomation,
	meowWorldProjectName,
	newsAutoKitteh,
	whatIsAutoKitteh,
} from "@src/constants";
import { TourId } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useModalStore, useProjectStore, useToastStore, useTourStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, IconButton, IconSvg, Spinner, Typography } from "@components/atoms";
import { WelcomeVideoCard, WelcomeVideoModal } from "@components/organisms/dashboard";
import { Socials } from "@components/organisms/shared/socials";

import { InJustA, OrStartFromTemplateImage, ProjectsIcon, StartFromTemplateImage } from "@assets/image";
import { ArrowRightCarouselIcon, ArrowStartTemplateIcon, CirclePlayIcon } from "@assets/image/icons";

import "swiper/css";
import "swiper/css/navigation";

export const IntroMainBlock = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const { t: tTours } = useTranslation("dashboard", { keyPrefix: "tours" });
	const { openModal } = useModalStore();
	const { isCreating } = useCreateProjectFromTemplate();
	const { startTour } = useTourStore();
	const { addToast } = useToastStore();
	const navigate = useNavigate();

	const { isProjectNameTaken } = useProjectStore();

	const meowWorldExist = isProjectNameTaken(meowWorldProjectName);

	const startQuickstartTour = async () => {
		const { data: newProjectData, error: newProjectError } = await startTour(TourId.quickstart);
		if (!newProjectData?.projectId || newProjectError) {
			addToast({
				message: tTours("projectCreationFailed"),
				type: "error",
			});
			return;
		}
		const { projectId, defaultFile } = newProjectData;

		navigate(`/projects/${projectId}/explorer`, {
			state: {
				fileToOpen: defaultFile,
				startTour: TourId.quickstart,
			},
		});
	};

	const handleOpenModal = (video: string) => {
		openModal(ModalName.welcomePage, { video });
	};

	const swiperButtonClass =
		"absolute z-10 flex size-9 top-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black transition hover:bg-gray-1000 active:scale-90";

	return (
		<div className="z-10 mt-7 select-none">
			<div className="flex items-stretch border-b border-gray-950 pb-6 font-averta text-white md:gap-x-14">
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

				<div className="flex w-full flex-col justify-center font-averta">
					<Typography className="text-center text-2xl font-bold md:text-left" element="h2">
						{t("cards.main.reliableAutomation")}
					</Typography>

					<Typography className="text-center text-2xl font-bold text-green-800 md:text-left" element="h2">
						<InJustA className="ml-5 inline-block" /> {t("cards.main.inAFewLinesOfCode")}
					</Typography>
					<div className="mt-4 hidden md:block">
						<div className="flex flex-wrap items-center justify-center gap-1">
							{meowWorldExist ? null : (
								<Button
									ariaLabel={t("cards.main.meowWorld")}
									className="mr-16 min-w-52 justify-center gap-3 rounded-full bg-green-800 py-2 font-averta text-2xl font-bold leading-tight hover:bg-green-200"
									onClick={startQuickstartTour}
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
					<div className="scrollbar mt-5 flex max-h-350 flex-col gap-7 overflow-auto md:mt-9">
						{getStartedWithAutoKitteh.map(({ description, image, title, youtubeLink }, index) => (
							<WelcomeVideoCard
								description={description}
								image={image}
								key={index}
								onPlay={() => handleOpenModal(youtubeLink)}
								title={title}
							/>
						))}
					</div>
				</div>
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
					<Typography className="mt-5 text-3xl font-bold" element="h2">
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
			<div className="mt-8 grid grid-cols-auto-fit-248 gap-x-14 gap-y-6 font-averta md:grid-cols-auto-fit-350">
				<div className="border-gray-950 md:border-r">
					<Socials
						fillBlockClass="h-0"
						iconsClass="size-7"
						titleClass="text-lg mb-3 "
						wrapperClass="flex-col items-start"
					/>
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
						{newsAutoKitteh.map((item, index) => (
							<SwiperSlide key={index}>{item}</SwiperSlide>
						))}
					</Swiper>
					<div className={cn(swiperButtonClass, "swiper-prev -left-6 md:-left-12")}>
						<ArrowRightCarouselIcon className="rotate-180" />
					</div>
					<div className={cn(swiperButtonClass, "swiper-next -right-1")}>
						<ArrowRightCarouselIcon />
					</div>
				</div>
			</div>

			<WelcomeVideoModal />
		</div>
	);
};

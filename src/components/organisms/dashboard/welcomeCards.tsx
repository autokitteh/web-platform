/* eslint-disable @liferay/empty-line-between-elements */
import React from "react";

import { Button, IconButton, IconSvg, Link, Typography } from "@components/atoms";

import { ProjectsIcon, StartFromTemplateImage } from "@assets/image";
import { ArrowStartTemplateIcon, CirclePlayIcon } from "@assets/image/icons";

export const WelcomeCards = () => {
	return (
		<div className="z-10 mt-7 grid gap-5">
			<div className="col-span-1 grid grid-cols-auto-fit-350 items-stretch gap-4 overflow-visible rounded-2xl border border-gray-950 bg-black p-8 pl-6 pr-4 font-averta text-white">
				<div className="flex flex-col">
					<div className="flex min-h-64 w-full flex-1 items-center justify-center rounded-2xl border-2 border-gray-750 bg-gray-1400">
						<IconButton className="group h-20 w-20 overflow-hidden rounded-full p-0">
							<CirclePlayIcon className="rounded-full transition group-hover:fill-white" />
						</IconButton>
					</div>
					<Typography className="mt-2 font-bold" element="p">
						Build anything with simple code. Use APIs and build your business logic: Serverless, no queues,
						secured, managed
					</Typography>
				</div>
				<div className="m-auto mt-2 w-full">
					<Typography className="text-center text-3xl font-bold 2xl:text-left" element="h2">
						Reliable Automation
					</Typography>

					<Typography className="text-center text-3xl font-bold 2xl:text-right" element="h2">
						In a <span className="text-green-800">Few Lines of Code</span>
					</Typography>

					<div className="mt-10">
						<div className="flex flex-col items-center justify-center gap-1">
							<Typography className="font-semibold text-gray-500" element="p">
								Start With Demo Project
							</Typography>
							<Button className="min-w-64 justify-center gap-3 rounded-full bg-green-800 py-3 font-averta text-2xl font-bold leading-tight hover:bg-green-200">
								<IconSvg size="lg" src={ProjectsIcon} />
								Meow world
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
				<div className="rounded-2xl border border-gray-950 bg-gray-1250 py-5 pl-6 pr-4 font-averta text-white">
					<Typography className="text-xl font-bold" element="h3">
						Starting a project -{" "}
						<Link className="font-normal text-green-800" to="#">
							docs
						</Link>
					</Typography>

					<div className="mt-2.5 flex items-center">
						<div className="flex min-h-32 w-full max-w-64 items-center justify-center rounded-2xl border border-gray-750 bg-gray-1400">
							<IconButton className="group h-11 w-11 overflow-hidden rounded-full p-0">
								<CirclePlayIcon className="rounded-full transition group-hover:fill-white" />
							</IconButton>
						</div>

						<ul className="font-base font-averta font-semibold leading-normal">
							<li>
								Develop Python code -{" "}
								<Link className="font-normal text-green-800" to="#">
									docs
								</Link>
							</li>

							<li>
								Configure{" "}
								<Link className="font-normal text-green-800" to="#">
									connections to applications
								</Link>
							</li>

							<li>
								Configure{" "}
								<Link className="font-normal text-green-800" to="#">
									Triggers
								</Link>
							</li>

							<li>Set vars - Optional</li>
						</ul>
					</div>
				</div>

				<div className="rounded-2xl border border-gray-950 bg-gray-1250 py-5 pl-6 pr-4 font-averta text-white">
					<Typography className="text-xl font-bold" element="h3">
						Develop in VS-Code,{" "}
						<Link className="font-normal text-green-800" to="#">
							using VS-Code Extension
						</Link>
					</Typography>

					<div className="mt-2.5 flex items-center">
						<div className="flex min-h-32 w-full max-w-64 items-center justify-center rounded-2xl border border-gray-750 bg-gray-1400">
							<IconButton className="group h-11 w-11 overflow-hidden rounded-full p-0">
								<CirclePlayIcon className="rounded-full transition group-hover:fill-white" />
							</IconButton>
						</div>

						<ul className="font-base font-averta font-semibold leading-normal">
							<li>Synchronization with the server</li>
							<li>Quick actions</li>
							<li>Dev tools</li>
							<li>Autocomplete</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

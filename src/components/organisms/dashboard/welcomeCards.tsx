/* eslint-disable @liferay/empty-line-between-elements */
import React from "react";

import { Button, IconButton, IconSvg, Link, Typography } from "@components/atoms";

import { ProjectsIcon, StartFromTemplateImage } from "@assets/image";
import { CirclePlayIcon } from "@assets/image/icons";

export const WelcomeCards = () => {
	return (
		<div className="z-10 mt-7 grid gap-5">
			<div className="col-span-1 flex w-full items-stretch gap-8 overflow-visible rounded-2xl border border-gray-950 bg-black p-8 pr-7 font-averta text-white">
				<div className="bg-gray-1400 flex w-full max-w-550 items-center justify-center rounded-2xl border-2 border-gray-750">
					<IconButton className="group h-20 w-20 overflow-hidden rounded-full p-0">
						<CirclePlayIcon className="rounded-full transition group-hover:fill-white" />
					</IconButton>
				</div>

				<div className="mt-2">
					<Typography className="text-3xl font-bold" element="h2">
						Reliable Automation
					</Typography>

					<Typography className="text-3xl font-bold" element="h2">
						In a Few Lines of Code
					</Typography>

					<Typography className="mt-4 font-bold" element="p">
						Build anything with simple code. Use APIs and build your business logic: Serverless, no queues,
						secured, managed
					</Typography>
					<div className="relative mt-10 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 pb-24">
						<Typography className="font-semibold text-gray-500" element="p">
							Start With Demo Project
						</Typography>

						<div className="relative">
							<Button className="min-w-64 justify-center gap-3 rounded-full bg-green-800 py-3 font-averta text-2xl font-bold leading-tight hover:bg-green-200">
								<IconSvg size="lg" src={ProjectsIcon} />
								Meow world
							</Button>
						</div>
						<StartFromTemplateImage className="absolute -right-12 bottom-0" />
					</div>
				</div>
			</div>

			<div className="grid-cols-auto-fit-350 grid gap-5">
				<div className="rounded-2xl border border-gray-950 bg-gray-1250 py-5 pl-6 pr-4 font-averta text-white">
					<Typography className="text-xl font-bold" element="h3">
						Starting a project -{" "}
						<Link className="font-normal text-green-800" to="#">
							docs
						</Link>
					</Typography>

					<div className="mt-2.5 flex items-center">
						<div className="bg-gray-1400 flex min-h-32 w-full max-w-64 items-center justify-center rounded-2xl border border-gray-750">
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
						<div className="bg-gray-1400 flex min-h-32 w-full max-w-64 items-center justify-center rounded-2xl border border-gray-750">
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

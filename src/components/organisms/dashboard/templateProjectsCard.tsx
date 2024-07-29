import React from "react";

import { TemplateCardType } from "@type/components";

import { Button, IconSvg, Status } from "@components/atoms";

import { PipeCircleIcon, PlusIcon } from "@assets/image/icons";

export const TemplateProjectCard = ({ card, category }: { card: TemplateCardType; category: string }) => {
	const createProjectFromAsset = () => {};

	return (
		<div className="relative flex flex-col rounded-md border border-gray-600 bg-white p-5 pr-3.5 shadow-community-card">
			<div className="flex items-center justify-between gap-1.5">
				<div className="flex gap-3">
					{card.integrations.map(({ icon, title }, index) => (
						<div
							className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 p-1"
							key={index}
							title={title}
						>
							<IconSvg className="z-10" size="lg" src={icon} />

							{index < card.integrations.length - 1 ? (
								<PipeCircleIcon className="absolute -right-4 top-1/2 -translate-y-1/2 fill-gray-500" />
							) : null}
						</div>
					))}
				</div>

				<Status>{category}</Status>
			</div>

			<div className="mt-4 text-xl font-bold">{card.title}</div>

			<div className="mb-4 mt-1 text-base">{card.description}</div>

			<Button onClick={createProjectFromAsset}>
				<PlusIcon className="absolute bottom-2 right-2 h-10 w-10" />
			</Button>
		</div>
	);
};

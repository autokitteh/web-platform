import React from "react";

import { CommunityProjectCardType } from "@type/components";

import { IconSvg, Status } from "@components/atoms";

import { IconLogo } from "@assets/image";
import { PipeCircleIcon } from "@assets/image/icons";

export const CommunityProjectCard = ({ card, category }: { card: CommunityProjectCardType; category: string }) => {
	return (
		<div className="flex flex-col rounded-md border border-black-300 bg-white p-5 pr-3.5 shadow-community-card">
			<div className="flex items-center justify-between gap-1.5">
				<div className="flex gap-3">
					{card.integrations.map(({ icon, title }, index) => (
						<div
							className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-550 p-1"
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

			<div className="mt-auto flex items-center gap-2">
				<IconSvg size="lg" src={IconLogo} />

				<span className="rounded-full text-xs font-bold text-gray-black-500">+{card.counter}</span>
			</div>
		</div>
	);
};

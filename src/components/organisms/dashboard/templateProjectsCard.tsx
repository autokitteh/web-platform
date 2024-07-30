import React from "react";

import { useTranslation } from "react-i18next";

import { TemplateCardType } from "@type/components";

import { Button, IconSvg, Status } from "@components/atoms";

import { PipeCircleIcon, PlusIcon } from "@assets/image/icons";

export const TemplateProjectCard = ({
	card,
	category,
	onCreateClick,
}: {
	card: TemplateCardType;
	category: string;
	onCreateClick: () => void;
}) => {
	const { t } = useTranslation(["manifest", "templates"]);

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
							<IconSvg className="z-10 rounded-full bg-white p-1" size="xl" src={icon} />

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

			<Button
				className="border-1 absolute bottom-2 right-2 rounded-full border border-solid border-black p-1 hover:bg-white"
				onClick={onCreateClick}
				title={t("createProject")}
			>
				<IconSvg size="md" src={PlusIcon} />
			</Button>
		</div>
	);
};

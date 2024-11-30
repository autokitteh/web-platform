import React, { useEffect, useState } from "react";

import * as Sentry from "@sentry/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { isProduction } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { Project } from "@type/models";

import { useSort } from "@hooks";
import { useModalStore, useProjectStore } from "@store";

import { Button, IconSvg, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

import { OrStartFromTemplateImage } from "@assets/image";
import { ArrowStartTemplateIcon, PlusAccordionIcon } from "@assets/image/icons";

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();

	const { items: sortedProjects, requestSort, sortConfig } = useSort<Project>(projectsList, "name");

	const { openModal } = useModalStore();

	const [widget, setWidget] = useState<ReturnType<typeof feedback.createWidget> | null>(null);

	const feedback = Sentry.feedbackIntegration();

	const initializeWidgetWithForm = async () => {
		const form = await feedback.createForm();
		form.appendToDom();
		setWidget(feedback.createWidget());
	};

	useEffect(() => {
		if (isProduction) initializeWidgetWithForm();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="z-10 h-2/3 select-none pt-10">
			<button
				onClick={async () => {
					if (widget) {
						widget.removeFromDom();
						setWidget(null);
					}
				}}
				type="button"
			>
				{widget ? "Remove Widget" : "Create Widget"}
			</button>
			{sortedProjects.length ? (
				<Table className="mt-2.5 h-auto max-h-full rounded-t-20 shadow-2xl">
					<THead>
						<Tr className="border-none pl-4">
							<Th className="group h-11 cursor-pointer font-normal" onClick={() => requestSort("name")}>
								{t("table.columns.projectName")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedProjects.map(({ href, id, name }) => (
							<Tr className="group cursor-pointer pl-4" key={id}>
								<Td className="group-hover:font-bold" onClick={() => navigate(href)}>
									{name}
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : null}

			<div className="mt-10 flex flex-col items-center justify-center">
				<Button
					className="gap-2.5 whitespace-nowrap rounded-full border border-gray-750 py-2.5 pl-3 pr-4 font-averta text-base font-semibold"
					onClick={() => openModal(ModalName.newProject)}
					variant="filled"
				>
					<IconSvg className="fill-white" size="lg" src={PlusAccordionIcon} />

					{t("buttons.startNewProject")}
				</Button>

				<div className="relative ml-5 mt-4">
					<OrStartFromTemplateImage />

					<ArrowStartTemplateIcon className="absolute -top-4 left-52" />
				</div>
			</div>
		</div>
	);
};

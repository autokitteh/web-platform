import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { featureFlags } from "@src/constants";
import { useProjectActions } from "@src/hooks";
import { useOrganizationStore, useSharedBetweenProjectsStore } from "@src/store";

import { Button, IconSvg, Tooltip, Typography } from "@components/atoms";
import { ImportProjectModal } from "@components/organisms";

import { PlusAccordionIcon, StartTemplateIcon } from "@assets/image/icons";
import MagicAiIcon from "@assets/image/icons/ai";

export const DashboardTopbar = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "topbar" });
	const { loadingImportFile, triggerFileInput } = useProjectActions();
	const { currentOrganization } = useOrganizationStore();
	const { fullScreenDashboard, setFullScreenDashboard } = useSharedBetweenProjectsStore();
	const navigate = useNavigate();
	const showTemplates = () => {
		setFullScreenDashboard(false);
	};

	const showChatBot = () => {
		navigate("/ai", {
			state: { projectCreationMode: true, hideButtons: true },
		});
	};

	return (
		<div className="z-10 flex flex-wrap">
			<div className="flex w-full flex-col items-center justify-between md:flex-row">
				<Typography
					className="w-full text-center font-averta text-2xl font-semibold md:mb-0 md:text-left"
					element="h1"
				>
					{t("welcome", { organization: currentOrganization?.displayName || t("autoKitteh") })}
				</Typography>

				<div className="relative hidden h-8 gap-1.5 self-center rounded-3xl border border-gray-750 p-1 transition hover:border-white md:flex">
					<Button
						ariaLabel={t("buttons.newProject")}
						className="group h-full gap-2 whitespace-nowrap p-1 hover:bg-gray-1050 active:bg-black"
						onClick={() => navigate("/ai")}
						title={t("buttons.newProject")}
						variant="light"
					>
						<IconSvg
							className="fill-white transition group-hover:fill-green-200 group-active:fill-green-800"
							src={PlusAccordionIcon}
						/>
						{t("buttons.newProject")}
					</Button>
					<div className="w-px bg-gray-750 transition" />

					{featureFlags.displayChatbot ? (
						<Button
							ariaLabel={t("buttons.ai")}
							className="group h-full gap-2 whitespace-nowrap p-1 hover:bg-gray-1050 active:bg-black"
							onClick={showChatBot}
							title={t("buttons.ai")}
							variant="light"
						>
							<IconSvg
								className="size-3 fill-white transition group-hover:fill-green-200 group-active:fill-green-800"
								src={MagicAiIcon}
							/>
							{t("buttons.ai")}
						</Button>
					) : null}

					<div className="w-px bg-gray-750 transition" />

					<Button
						ariaLabel={t("buttons.import")}
						className="group h-full gap-2 whitespace-nowrap hover:bg-gray-1050 active:bg-black"
						disabled={loadingImportFile}
						onClick={triggerFileInput}
						title={t("buttons.import")}
						variant="light"
					>
						{t("buttons.import")}
					</Button>
				</div>
				{fullScreenDashboard ? (
					<Tooltip content={t("buttons.openTemplates")} position="bottom">
						<Button className="group ml-4 p-2 hover:bg-gray-1050" onClick={() => showTemplates()}>
							<IconSvg className="size-5 fill-white" src={StartTemplateIcon} />
						</Button>
					</Tooltip>
				) : null}
			</div>
			<ImportProjectModal />
		</div>
	);
};

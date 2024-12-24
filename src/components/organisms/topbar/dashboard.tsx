import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@src/enums/components";
import { useProjectActions } from "@src/hooks";
import { useModalStore } from "@src/store";

import { Button, IconSvg, Typography } from "@components/atoms";
import { ImportProjectModal } from "@components/organisms";

import { PlusAccordionIcon } from "@assets/image/icons";

export const DashboardTopbar = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "topbar" });
	const { fileInputRef, handleImportFile, loadingImportFile } = useProjectActions();
	const { openModal } = useModalStore();

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="z-10 flex flex-wrap">
			<div className="flex w-full flex-col items-center justify-between md:flex-row">
				<Typography
					className="mb-8 w-full text-center font-averta text-2xl font-semibold md:mb-0 md:text-left md:text-2xl"
					element="h1"
				>
					{t("welcome")}
				</Typography>

				<div className="relative flex h-8 gap-1.5 self-center rounded-3xl border border-gray-750 p-1 transition hover:border-white">
					<Button
						ariaLabel={t("buttons.newProject")}
						className="group h-full gap-2 whitespace-nowrap p-1 hover:bg-gray-1050 active:bg-black"
						onClick={() => openModal(ModalName.newProject)}
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
					<input
						accept=".zip"
						className="hidden"
						onChange={handleImportFile}
						ref={fileInputRef}
						type="file"
					/>
				</div>
			</div>
			<ImportProjectModal />
		</div>
	);
};

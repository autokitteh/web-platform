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

				<div className="flex rounded-full border border-gray-750 font-averta text-base font-semibold">
					<Button
						className="gap-2.5 whitespace-nowrap rounded-none rounded-l-full border-r border-gray-750 px-3 py-2.5"
						onClick={() => openModal(ModalName.newProject)}
						variant="filled"
					>
						<IconSvg className="fill-white" size="lg" src={PlusAccordionIcon} />
						{t("buttons.newProject")}
					</Button>
					<Button
						className="gap-2.5 whitespace-nowrap rounded-none rounded-r-full px-3 py-2.5"
						disabled={loadingImportFile}
						onClick={triggerFileInput}
						variant="filled"
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

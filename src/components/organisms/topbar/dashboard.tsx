import React from "react";

import { useTranslation } from "react-i18next";

import { useModalStore } from "@store";

import { Button, IconSvg, Typography } from "@components/atoms";

import { PlusAccordionIcon, UploadIcon } from "@assets/image/icons";

export const DashboardTopbar = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "topbar" });
	const { openModal } = useModalStore();

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="z-10 flex flex-wrap">
			<div className="flex w-full items-center justify-between">
				<Typography
					className="w-full text-center font-averta text-2xl font-semibold md:text-left md:text-2xl"
					element="h1"
				>
					{t("welcome")}
				</Typography>

				<div className="flex rounded-full border border-gray-750 font-averta text-base font-semibold">
					<Button
						className="gap-2.5 whitespace-nowrap rounded-none rounded-l-full border-r border-gray-750 px-3 py-2.5"
						disabled={loadingNewProject}
						onClick={handleCreateProject}
						variant="filled"
					>
						<IconSvg
							className="fill-white"
							size="lg"
							src={!loadingNewProject ? PlusAccordionIcon : Spinner}
						/>
						{t("buttons.newProject")}
					</Button>
					<Button
						className="gap-2.5 whitespace-nowrap rounded-none rounded-r-full px-3 py-2.5"
						disabled={loadingImportFile}
						onClick={triggerFileInput}
						variant="filled"
					>
						{loadingImportFile ? (
							<Loader size="sm" />
						) : (
							<IconSvg className="fill-white" size="md" src={UploadIcon} />
						)}
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
		</div>
	);
};

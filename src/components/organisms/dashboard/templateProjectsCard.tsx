import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { namespaces } from "@constants/index";
import { HttpService, LoggerService } from "@services/index";
import { ManifestService } from "@services/manifest.service";
import { useFileOperations } from "@src/hooks";
import { fetchAllFilesContent } from "@src/utilities";
import { TemplateCardType } from "@type/components";

import { useProjectStore, useToastStore } from "@store";

import { Button, IconSvg, Status } from "@components/atoms";

import { PipeCircleIcon, PlusIcon } from "@assets/image/icons";
import { filesPerProject } from "@assets/templates";

export const TemplateProjectCard = ({ card, category }: { card: TemplateCardType; category: string }) => {
	const addToast = useToastStore((state) => state.addToast);
	const { t } = useTranslation("manifest");
	const { getProjectsList } = useProjectStore();
	const [projectId, setProjectId] = React.useState<string | null>(null);
	const navigate = useNavigate();

	const { saveAllFiles } = useFileOperations(projectId || "");

	const getAndSaveFiles = async () => {
		const filesData = await fetchAllFilesContent(card.asset_directory, filesPerProject[card.asset_directory]);

		if (projectId) {
			await saveAllFiles(filesData);
			navigate(`/projects/${projectId}/connections`);
		}
	};

	React.useEffect(() => {
		if (projectId) {
			getAndSaveFiles();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const createProjectFromAsset = async () => {
		try {
			const manifestURL = `/assets/templates/${card.asset_directory}/autokitteh.yaml`;
			const { data: projectYamlManifest } = await HttpService.get(manifestURL, {
				responseType: "text",
			});

			const { data: newProjectId, error } = await ManifestService.applyManifest(projectYamlManifest);
			if (error) {
				addToast({
					id: Date.now().toString(),
					message: t("projectCreationFailedExtended", { error: t("projectNameExist") }),
					type: "error",
				});

				LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);

				return;
			}

			const successMessage = t("projectCreatedSuccessfully");
			addToast({
				id: Date.now().toString(),
				message: successMessage,
				type: "success",
			});

			setProjectId(newProjectId!);
			getProjectsList();
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: t("projectCreationFailed"),
				type: "error",
			});

			LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);
		}
	};

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

			<Button className="hover:bg-white" onClick={createProjectFromAsset}>
				<PlusIcon className="absolute bottom-2 right-2 h-10 w-10" />
			</Button>
		</div>
	);
};

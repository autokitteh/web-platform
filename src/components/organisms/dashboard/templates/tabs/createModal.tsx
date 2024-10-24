import React, { useEffect, useState } from "react";

import { Editor } from "@monaco-editor/react";
import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { CreateProjectModalProps } from "@interfaces/components";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useModalStore } from "@src/store";
import { fetchFileContent } from "@src/utilities";

import { Button, IconSvg, Input, Loader, Status, Typography } from "@components/atoms";
import { Modal } from "@components/molecules";

import { PipeCircleDarkIcon, ReadmeIcon } from "@assets/image/icons";

export const ProjectTemplateCreateModal = ({ cardTemplate, category }: CreateProjectModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "createProjectWithTemplate" });
	const [isCreating, setIsCreating] = useState(false);
	const [manifestData, setManifestData] = useState<string | null>(null);
	const { assetDirectory, description, integrations } = cardTemplate;
	const { closeModal } = useModalStore();
	const { createProjectFromTemplate } = useCreateProjectFromTemplate();

	const fetchManifestData = async () => {
		if (!assetDirectory) return;
		const content = await fetchFileContent(`/assets/templates/${assetDirectory}/README.md`);
		setManifestData(content);
	};

	useEffect(() => {
		fetchManifestData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [assetDirectory]);

	const createProjectFromAsset = async () => {
		if (!assetDirectory) return;
		setIsCreating(true);
		await createProjectFromTemplate(assetDirectory);
		setIsCreating(false);
		closeModal(ModalName.templateCreateProject);
	};

	return (
		<Modal className="p-5" hideCloseButton name={ModalName.templateCreateProject}>
			<div className="mb-3 flex items-center justify-end gap-5">
				<Status>{category}</Status>
				<div className="flex gap-3">
					{integrations.map(({ icon, label }, index) => (
						<div
							className="relative flex size-8 items-center justify-center rounded-full bg-gray-1400 p-1"
							key={index}
							title={label}
						>
							<IconSvg className="z-10 rounded-full p-1" size="xl" src={icon} />
							{index < integrations.length - 1 ? (
								<PipeCircleDarkIcon className="absolute -right-4 top-1/2 -translate-y-1/2 fill-gray-500" />
							) : null}
						</div>
					))}
				</div>
			</div>
			<Input label={t("projectName")} variant="light" />
			<Typography className="mt-2 font-semibold" element="h4" size="medium">
				{description}
			</Typography>
			<div className="mt-4 flex items-center gap-1 text-base uppercase">
				<ReadmeIcon className="size-4" /> {t("readme")}
			</div>
			<Editor
				className="h-96"
				defaultLanguage="markdown"
				options={{
					fontFamily: "monospace, sans-serif",
					fontSize: 14,
					minimap: { enabled: false },
					renderLineHighlight: "none",
					scrollBeyondLastLine: false,
					wordWrap: "on",
					readOnly: true,
					lineNumbers: "off",
				}}
				theme="vs-dark"
				value={manifestData || ""}
			/>
			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.templateCreateProject)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>
				<Button
					ariaLabel={t("createButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold"
					disabled={isCreating}
					onClick={createProjectFromAsset}
					variant="filled"
				>
					{isCreating ? <Loader className="mr-2" size="sm" /> : null}
					{t("createButton")}
				</Button>
			</div>
		</Modal>
	);
};

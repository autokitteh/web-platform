import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { DrawerName } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { useCacheStore, useDrawerStore, useManualRunStore, useToastStore } from "@src/store";
import { validateManualRun } from "@validations";

import { Button, IconSvg, Spinner, Typography } from "@components/atoms";
import { Drawer, Select } from "@components/molecules";
import { SelectCreatable } from "@components/molecules/select";
import { ManualRunParamsForm, ManualRunSuccessToastMessage } from "@components/organisms/topbar/project";

import { RunIcon } from "@assets/image/icons";

export const ManualRunSettingsDrawer = () => {
	const { t: tButtons } = useTranslation("buttons");
	const { t } = useTranslation("deployments", { keyPrefix: "history.manualRun" });
	const { closeDrawer } = useDrawerStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchDeployments } = useCacheStore();

	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
	const { projectId } = useParams();
	const [sendingManualRun, setSendingManualRun] = useState(false);
	const [isValid, setIsValid] = useState(false);

	const { projectManualRun, saveAndExecuteManualRun, updateManualRunConfiguration } = useManualRunStore((state) => ({
		projectManualRun: state.projectManualRun[projectId!],
		saveAndExecuteManualRun: state.saveAndExecuteManualRun,
		updateManualRunConfiguration: state.updateManualRunConfiguration,
	}));

	const { activeDeployment, entrypointFunction, filesSelectItems, filePath, files, params } = projectManualRun || {};
	const [fileFunctions, setFileFunctions] = useState<{ label: string; value: string }[]>([]);

	useEffect(() => {
		if (!filePath) return;
		if (!files || !filePath?.value) return;
		const processedFileFunctions =
			files[filePath.value]?.map((fileFunction) => ({
				label: fileFunction,
				value: fileFunction,
			})) || [];
		setFileFunctions(processedFileFunctions);
	}, [filePath, files]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!projectId || !validateForm()) return;

		setSendingManualRun(true);
		const { data: sessionId, error } = await saveAndExecuteManualRun(projectId);

		setSendingManualRun(false);
		fetchDeploymentAfterManualRun();

		if (error) {
			addToast({
				message: t("executionFailed"),
				type: "error",
			});
			LoggerService.error(namespaces.sessionsService, `${t("executionFailedExtended", { projectId, error })}`);
			return;
		}

		addToast({
			message: (
				<ManualRunSuccessToastMessage
					deploymentId={activeDeployment?.deploymentId}
					projectId={projectId}
					sessionId={sessionId}
				/>
			),
			type: "success",
		});
		closeDrawer(DrawerName.projectManualRunSettings);
	};

	const fetchDeploymentAfterManualRun = () => {
		setTimeout(() => {
			fetchDeployments(projectId!, true);
		}, 100);
	};

	const onEntrypointCreate = (value: string) => {
		const newFunction = { label: value, value };
		setFileFunctions((prev) => [...prev, newFunction]);
	};
	// First, add isValid state

	// Modify validateForm to update isValid state
	const validateForm = useCallback(() => {
		const result = validateManualRun({
			filePath,
			entrypointFunction,
			params: params || "{}",
		});

		if (!result.success) {
			const errors = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [key, value?.join(", ")])
			);
			setValidationErrors(errors);
			setIsValid(false);
			return false;
		}

		setValidationErrors({});
		setIsValid(true);
		return true;
	}, [filePath, entrypointFunction, params]);

	// Add effect to validate on any field change
	useEffect(() => {
		validateForm();
	}, [filePath, entrypointFunction, params, validateForm]);

	// Update handlers to include validation after state update
	const handleFilePathChange = (selected: SingleValue<SelectOption>) => {
		updateManualRunConfiguration(projectId!, { filePath: selected });
	};

	const handleEntrypointChange = (selected: SingleValue<SelectOption>) => {
		updateManualRunConfiguration(projectId!, { entrypointFunction: selected });
	};

	return (
		<Drawer className="p-10" name={DrawerName.projectManualRunSettings} variant="dark">
			<form onSubmit={onSubmit}>
				<div className="flex items-center justify-between gap-3">
					<Typography className="text-gray-500">{t("configuration")}</Typography>
					<div className="flex items-center justify-end gap-6">
						<Button
							ariaLabel={tButtons("cancel")}
							className="p-0 font-semibold text-gray-500 hover:text-white"
							onClick={() => closeDrawer(DrawerName.projectManualRunSettings)}
						>
							{tButtons("cancel")}
						</Button>

						<Button
							ariaLabel={tButtons("saveAndRun")}
							className="border-white px-4 py-2 font-semibold text-white hover:bg-black"
							disabled={!isValid}
							type="submit"
							variant="outline"
						>
							<IconSvg className="stroke-white" src={!sendingManualRun ? RunIcon : Spinner} />

							{tButtons("saveAndRun")}
						</Button>
					</div>
				</div>

				<div className="relative mt-16">
					<Select
						aria-label={t("placeholders.selectFile")}
						dataTestid="select-file"
						disabled={!filesSelectItems.length}
						isError={!!validationErrors.filePath}
						label={t("placeholders.file")}
						noOptionsLabel={t("noFilesAvailable")}
						onChange={handleFilePathChange}
						options={filesSelectItems}
						placeholder={t("placeholders.selectFile")}
						value={filePath}
					/>
				</div>

				<div className="relative mt-3">
					<SelectCreatable
						aria-label={t("placeholders.selectEntrypoint")}
						dataTestid="select-function"
						disabled={!fileFunctions.length}
						isError={!!validationErrors.entrypointFunction}
						label={t("placeholders.entrypoint")}
						noOptionsLabel={t("noFunctionsAvailable")}
						onChange={handleEntrypointChange}
						onCreateOption={onEntrypointCreate}
						options={fileFunctions}
						placeholder={t("placeholders.selectEntrypoint")}
						value={entrypointFunction}
					/>
				</div>
			</form>
			<ManualRunParamsForm />
		</Drawer>
	);
};

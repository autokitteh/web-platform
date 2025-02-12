import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { DrawerName } from "@src/enums/components";
import { useCacheStore, useDrawerStore, useManualRunStore, useToastStore } from "@src/store";
import { safeJsonParse } from "@src/utilities";
import { manualRunSchema } from "@validations";

import { Button, ErrorMessage, IconSvg, Spinner, Typography } from "@components/atoms";
import { Drawer, Select } from "@components/molecules";
import { SelectCreatable } from "@components/molecules/select";
import { ManualRunParamsForm, ManualRunSuccessToastMessage } from "@components/organisms/topbar/project";

import { RunIcon } from "@assets/image/icons";

// TODO after we have the new JSON format in the backend, we can remove this function.
// The function should check if manual run params are in the new JSON format and convert them into an array of key-value.
const revertParamsStructure = (params: object | string | Array<{ key: string; value: string }>) => {
	if (!params) return [];
	if (Array.isArray(params)) return params;
	if (typeof params === "string" && safeJsonParse(params as string))
		return Object.entries(safeJsonParse(params)).map(([key, value]) => ({ key, value }));
	return Object.entries(params).map(([key, value]) => ({ key, value: JSON.stringify(value) }));
};

export const ManualRunSettingsDrawer = () => {
	const { t: tButtons } = useTranslation("buttons");
	const { t } = useTranslation("deployments", { keyPrefix: "history.manualRun" });
	const { closeDrawer } = useDrawerStore();
	const addToast = useToastStore((state) => state.addToast);
	const { projectId } = useParams();
	const [sendingManualRun, setSendingManualRun] = useState(false);
	const { fetchDeployments } = useCacheStore();

	const { projectManualRun, saveAndExecuteManualRun, updateManualRunConfiguration } = useManualRunStore((state) => ({
		projectManualRun: state.projectManualRun[projectId!],
		updateManualRunConfiguration: state.updateManualRunConfiguration,
		saveAndExecuteManualRun: state.saveAndExecuteManualRun,
	}));

	const { activeDeployment, entrypointFunction, fileOptions, filePath, files, params } = projectManualRun || {};

	const methods = useForm({
		resolver: zodResolver(manualRunSchema),
		defaultValues: {
			filePath,
			entrypointFunction,
			params: revertParamsStructure(params),
		},
		mode: "onChange",
	});

	const [fileFunctions, setFileFunctions] = useState<{ label: string; value: string }[]>([]);

	const {
		control,
		formState: { errors, isValid },
		getValues,
		handleSubmit,
		setValue,
	} = methods;

	useEffect(() => {
		if (!filePath) return;
		setValue("filePath", filePath);

		if (!files && filePath.value) return;
		const processedFileFunctions =
			files[filePath.value]?.map((fileFunction) => ({
				label: fileFunction,
				value: fileFunction,
			})) || [];
		setFileFunctions(processedFileFunctions);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filePath, files]);

	useEffect(() => {
		setValue("entrypointFunction", entrypointFunction);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [entrypointFunction]);

	useEffect(() => {
		if (params) {
			setValue("params", revertParamsStructure(params));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params]);

	const handleManualRun = () => {
		setTimeout(() => {
			fetchDeployments(projectId!, true);
		}, 100);
	};

	const onSubmit = async () => {
		if (!projectId) return;

		setSendingManualRun(true);
		const { params: formParams } = getValues();
		const correctedParams = formParams.map(({ key, value }) => ({
			key,
			value: typeof value === "string" && safeJsonParse(value) ? value : JSON.stringify(value),
		}));
		const { data: sessionId, error } = await saveAndExecuteManualRun(projectId, correctedParams);
		setSendingManualRun(false);
		updateManualRunConfiguration(projectId, { params: formParams });
		handleManualRun();
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

	const entrypointFunctionValue = useWatch({ control, name: "entrypointFunction" });
	const onEntrypointCreate = (value: string) => {
		const newFunction = { label: value, value };
		setFileFunctions((prev) => [...prev, newFunction]);
		setValue("entrypointFunction", newFunction);
	};

	return (
		<Drawer className="p-10" name={DrawerName.projectManualRunSettings} variant="dark">
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)}>
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
						<Controller
							control={control}
							name="filePath"
							render={({ field }) => (
								<Select
									{...field}
									aria-label={t("placeholders.selectFile")}
									dataTestid="select-file"
									disabled={!fileOptions.length}
									isError={!!errors.filePath}
									label={t("placeholders.file")}
									noOptionsLabel={t("noFilesAvailable")}
									onChange={(selected) => {
										field.onChange(selected);
										updateManualRunConfiguration(projectId!, { filePath: selected! });
									}}
									options={fileOptions}
									placeholder={t("placeholders.selectFile")}
									value={field.value}
								/>
							)}
						/>

						<ErrorMessage>{errors.filePath?.message}</ErrorMessage>
					</div>

					<div className="relative mt-3">
						<Controller
							control={control}
							name="entrypointFunction"
							render={({ field }) => (
								<SelectCreatable
									{...field}
									aria-label={t("placeholders.selectEntrypoint")}
									dataTestid="select-function"
									isError={!!errors.entrypointFunction}
									label={t("placeholders.entrypoint")}
									noOptionsLabel={t("noFunctionsAvailable")}
									onChange={(selected) => {
										field.onChange(selected);
										updateManualRunConfiguration(projectId!, { entrypointFunction: selected! });
									}}
									onCreateOption={onEntrypointCreate}
									options={fileFunctions}
									placeholder={t("placeholders.selectEntrypoint")}
									value={entrypointFunctionValue}
								/>
							)}
						/>
						<ErrorMessage className="relative">{errors.entrypointFunction?.message as string}</ErrorMessage>
					</div>
				</form>

				<ManualRunParamsForm />
			</FormProvider>
		</Drawer>
	);
};

import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { DrawerName } from "@src/enums/components";
import { useCacheStore, useDrawerStore, useManualRunStore, useToastStore } from "@src/store";
import { manualRunSchema } from "@validations";

import { Button, ErrorMessage, IconSvg, Spinner, Typography } from "@components/atoms";
import { Drawer, Select } from "@components/molecules";
import { ManualRunParamsForm, ManualRunSuccessToastMessage } from "@components/organisms/topbar/project";

import { RunIcon } from "@assets/image/icons";

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

	const { entrypointFunction, fileOptions, filePath, files, lastDeployment, params } = projectManualRun || {};

	const methods = useForm({
		resolver: zodResolver(manualRunSchema),
		defaultValues: {
			filePath,
			entrypointFunction,
			params,
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
	}, [filePath]);

	useEffect(() => {
		setValue("entrypointFunction", entrypointFunction);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [entrypointFunction]);

	useEffect(() => {
		if (params) {
			setValue("params", params);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params]);

	const handleMunaualRun = () => {
		setTimeout(() => {
			fetchDeployments(projectId!, true);
		}, 100);
	};

	const onSubmit = async () => {
		if (!projectId) return;

		setSendingManualRun(true);
		const { params } = getValues();

		const { data: sessionId, error } = await saveAndExecuteManualRun(projectId, params);
		setSendingManualRun(false);
		handleMunaualRun();
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
					deploymentId={lastDeployment?.deploymentId}
					projectId={projectId}
					sessionId={sessionId}
				/>
			),
			type: "success",
		});
		closeDrawer(DrawerName.projectManualRunSettings);
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
										updateManualRunConfiguration(projectId!, { entrypointFunction: selected! });
									}}
									options={fileFunctions}
									placeholder={t("placeholders.selectFile")}
									value={field.value}
								/>
							)}
						/>
						{/* <Controller
							control={control}
							name="entrypointFunction"
							render={({ field }) => (
								<Input
									{...field}
									aria-label={t("placeholders.selectEntrypoint")}
									isError={!!errors.entrypointFunction}
									isRequired
									label={t("placeholders.entrypoint")}
									onChange={(event) => {
										field.onChange(event);
										updateManualRunConfiguration(projectId!, {
											entrypointFunction: event.target.value,
										});
									}}
								/>
							)}
						/> */}

						<ErrorMessage className="relative">{errors.entrypointFunction?.message as string}</ErrorMessage>
					</div>
				</form>

				<ManualRunParamsForm />
			</FormProvider>
		</Drawer>
	);
};

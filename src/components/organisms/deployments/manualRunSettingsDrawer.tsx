import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { DrawerName } from "@src/enums/components";
import { useDrawerStore, useManualRunStore, useToastStore } from "@src/store";
import { manualRunSchema } from "@validations";

import { Button, ErrorMessage, IconSvg, Spinner } from "@components/atoms";
import { Drawer, Select } from "@components/molecules";
import { ManualRunParamsForm } from "@components/organisms/deployments";

import { RunIcon } from "@assets/image";

export const ManualRunSettingsDrawer = () => {
	const { t: tButtons } = useTranslation("buttons");
	const { t } = useTranslation("deployments", { keyPrefix: "history.manualRun" });
	const { closeDrawer } = useDrawerStore();
	const addToast = useToastStore((state) => state.addToast);
	const { projectId } = useParams();
	const [sendingManualRun, setSendingManualRun] = useState(false);

	const { projectManualRun, saveProjectManualRun, updateProjectManualRun } = useManualRunStore((state) => ({
		projectManualRun: state.projectManualRun[projectId!],
		updateProjectManualRun: state.updateProjectManualRun,
		saveProjectManualRun: state.saveProjectManualRun,
	}));

	const { entrypointFunction, entrypointFunctions, fileOptions, filePath, params } = projectManualRun || {};

	const methods = useForm({
		resolver: zodResolver(manualRunSchema),
		defaultValues: {
			filePath,
			entrypointFunction,
			params,
		},
		mode: "onBlur",
	});
	const {
		control,
		formState: { errors, isValid },
		getValues,
		handleSubmit,
		setValue,
	} = methods;

	useEffect(() => {
		if (filePath) {
			setValue("filePath", filePath);
			setValue("entrypointFunction", entrypointFunction);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filePath]);

	useEffect(() => {
		if (entrypointFunction) {
			setValue("entrypointFunction", entrypointFunction);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [entrypointFunction]);

	useEffect(() => {
		if (params) {
			setValue("params", params);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params]);

	const onSubmit = async () => {
		if (!projectId) return;

		setSendingManualRun(true);
		const { params } = getValues();

		const { data: sessionId, error } = await saveProjectManualRun(projectId, params);
		setSendingManualRun(false);
		if (error) {
			addToast({
				message: t("executionFailed"),
				type: "error",
			});
			LoggerService.error(namespaces.sessionsService, `${t("executionFailedExtended", { projectId, error })}`);

			return;
		}
		addToast({
			message: t("executionSucceed", { sessionId }),
			type: "success",
		});
		closeDrawer(DrawerName.projectManualRunSettings);
	};

	return (
		<Drawer name={DrawerName.projectManualRunSettings} variant="dark">
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)}>
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
							<IconSvg src={!sendingManualRun ? RunIcon : Spinner} />

							{tButtons("saveAndRun")}
						</Button>
					</div>

					<div className="relative mt-6">
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
										updateProjectManualRun(projectId!, { filePath: selected! }, false);
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
									aria-label={t("placeholders.selectEntrypoint")}
									dataTestid="select-entrypoint"
									isError={entrypointFunctions?.length ? !!errors.entrypointFunction : false}
									label={t("placeholders.entrypoint")}
									noOptionsLabel={t("noFunctionsFound")}
									onChange={(selected) => {
										field.onChange(selected);
										setValue("params", []);
										updateProjectManualRun(projectId!, { entrypointFunction: selected! }, false);
									}}
									options={entrypointFunctions}
									placeholder={t("placeholders.selectEntrypoint")}
									value={field.value}
								/>
							)}
						/>

						{entrypointFunctions?.length ? (
							<ErrorMessage>{errors.entrypointFunction?.message}</ErrorMessage>
						) : null}
					</div>
				</form>

				<ManualRunParamsForm />
			</FormProvider>
		</Drawer>
	);
};

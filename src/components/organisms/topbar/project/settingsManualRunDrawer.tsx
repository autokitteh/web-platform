import React from "react";

import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { DrawerName } from "@src/enums/components";
import { useDrawerStore } from "@src/store";

import { Button, ErrorMessage, IconButton, Input } from "@components/atoms";
import { Drawer, Select } from "@components/molecules";

import { PlusCircle } from "@assets/image";
import { InfoIcon, TrashIcon } from "@assets/image/icons";

export const SettingsManualRunDrawer = () => {
	const { t: tButtons } = useTranslation("buttons");
	const { t } = useTranslation("projects", { keyPrefix: "manualRun" });
	const { closeDrawer } = useDrawerStore();

	const {
		control,
		formState: { errors },
	} = useForm({
		defaultValues: {
			filePath: { label: "", value: "" },
			entrypoint: { label: "", value: "" },
		},
	});

	return (
		<Drawer name={DrawerName.projectRunSettings} variant="dark">
			<form>
				<div className="flex items-center justify-end gap-6">
					<Button
						ariaLabel={tButtons("cancel")}
						className="p-0 font-semibold text-gray-500 hover:text-white"
						onClick={() => closeDrawer(DrawerName.projectRunSettings)}
					>
						{tButtons("cancel")}
					</Button>

					<Button
						ariaLabel={tButtons("save")}
						className="border-white px-4 py-2 font-semibold text-white hover:bg-black"
						type="submit"
						variant="outline"
					>
						{tButtons("save")}
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
								isError={!!errors.filePath}
								label={t("placeholders.file")}
								noOptionsLabel={t("noFilesAvailable")}
								onChange={(selected) => field.onChange(selected)}
								options={[]}
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
						name="entrypoint"
						render={({ field }) => (
							<Select
								{...field}
								aria-label={t("placeholders.selectEntrypoint")}
								dataTestid="select-entrypoint"
								isError={!!errors.filePath}
								label={t("placeholders.entrypoint")}
								noOptionsLabel={t("noFunctionsAvailable")}
								onChange={(selected) => field.onChange(selected)}
								options={[]}
								placeholder={t("placeholders.selectEntrypoint")}
								value={field.value}
							/>
						)}
					/>

					<ErrorMessage>{errors.entrypoint?.message}</ErrorMessage>
				</div>

				<div className="mt-5">
					<div className="flex items-center gap-1 text-base text-gray-500">
						{t("titleParams")}

						<div className="cursor-pointer" title={t("titleParams")}>
							<InfoIcon className="fill-white" />
						</div>
					</div>

					<div className="mb-2 flex flex-col gap-2">
						<div className="align-center flex gap-1">
							<div className="flex w-full gap-3">
								<Input
									aria-label={t("placeholders.key")}
									className="w-full"
									label={t("placeholders.key")}
								/>

								<Input
									aria-label={t("placeholders.value")}
									className="w-full"
									label={t("placeholders.value")}
								/>
							</div>

							<IconButton
								ariaLabel={t("ariaDeleteParam")}
								className="self-center bg-gray-1300 hover:bg-black"
							>
								<TrashIcon className="h-4 w-4 fill-white" />
							</IconButton>
						</div>
					</div>

					<Button
						className="group ml-auto w-auto gap-1 p-0 font-semibold text-gray-500 hover:text-white"
						type="button"
					>
						<PlusCircle className="h-5 w-5 stroke-gray-500 duration-300 group-hover:stroke-white" />

						{t("buttons.addNewParameter")}
					</Button>
				</div>
			</form>
		</Drawer>
	);
};

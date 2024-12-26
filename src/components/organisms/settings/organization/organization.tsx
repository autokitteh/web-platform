import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ModalName } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { useModalStore } from "@src/store";
import { organizationSchema } from "@validations";

import { Button, ErrorMessage, Input, Typography } from "@components/atoms";
import { Select } from "@components/molecules";
import { DeleteOrganizationModal } from "@components/organisms/settings/organization";

export const OrganizationSettings = () => {
	const options: SelectOption[] = [
		{ value: "disabled", label: "Disabled" },
		{ value: "daily", label: "Daily" },
		{ value: "hourly", label: "Hourly" },
		{ value: "immediate", label: "Immediate" },
	];

	const { t } = useTranslation("settings", { keyPrefix: "organization" });
	const {
		control,
		formState: { errors },
		handleSubmit,
		register,
	} = useForm({
		resolver: zodResolver(organizationSchema),
		mode: "onSubmit",
	});
	const { openModal } = useModalStore();

	const onSubmit = async () => {};

	const watchedFrequency = useWatch({ control, name: "frequency" });

	return (
		<div>
			<Typography className="mb-9 font-bold" element="h2" size="xl">
				Organization {t("form.settings")}
			</Typography>
			<div className="flex flex-wrap gap-10">
				<div className="w-1/2">
					<Typography className="mb-2 font-bold" element="h2" size="medium">
						{t("limits")}
					</Typography>
					<div className="flex gap-3">
						<div className="w-1/2 rounded bg-gray-950 p-3 text-base shadow-xl">
							<Typography className="mb-1" element="h5">
								{t("seats")}
							</Typography>
							<Typography className="font-medium" element="h4" size="xl">
								22
							</Typography>
						</div>
						<div className="w-1/2 rounded bg-gray-950 p-3 text-base shadow-xl">
							<Typography className="mb-1" element="h5">
								{t("monthlySpending")}
							</Typography>
							<Typography className="font-medium" element="h4" size="xl">
								$333
							</Typography>
						</div>
					</div>
				</div>
				<form className="w-1/2" onSubmit={handleSubmit(onSubmit)}>
					<div className="relative mb-6">
						<Input
							isError={!!errors.orgName}
							isRequired
							label={t("form.organizationName")}
							{...register("orgName")}
						/>

						<ErrorMessage>{errors?.orgName?.message as string}</ErrorMessage>
					</div>
					<div className="relative mb-8">
						<Input
							isError={!!errors.displayName}
							label={t("form.displayName")}
							{...register("displayName")}
						/>

						<ErrorMessage>{errors?.displayName?.message as string}</ErrorMessage>
					</div>
					<Typography className="mb-4 font-bold" element="h2" size="medium">
						{t("form.errorNotification")}
					</Typography>
					<div className="relative mb-6">
						<Input
							isError={!!errors.noteEmail}
							label={t("form.placeholder.notificationEmail")}
							{...register("noteEmail")}
						/>

						<ErrorMessage>{errors?.noteEmail?.message as string}</ErrorMessage>
					</div>
					<div className="relative mb-3">
						<Controller
							control={control}
							name="frequency"
							render={({ field }) => (
								<Select
									{...field}
									aria-label={t("form.placeholder.frequency")}
									isError={!!errors.frequency}
									label={t("form.placeholder.frequency")}
									options={options}
									placeholder={t("form.placeholder.frequency")}
									value={watchedFrequency}
								/>
							)}
						/>

						<ErrorMessage>{errors.frequency?.message as string}</ErrorMessage>
					</div>
					<div className="flex justify-between gap-2">
						<Button
							className="w-fit border-black bg-black px-5 text-base font-medium text-white hover:bg-gray-950"
							onClick={() => openModal(ModalName.deleteOrganization)}
							type="button"
							variant="outline"
						>
							{t("form.buttons.deleteOrganization")}
						</Button>
						<Button
							className="w-fit border-black bg-white px-5 text-base font-medium hover:bg-gray-950 hover:text-white"
							type="submit"
							variant="outline"
						>
							{t("form.buttons.save")}
						</Button>
					</div>
				</form>
				<DeleteOrganizationModal />
			</div>
		</div>
	);
};

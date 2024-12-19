import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { ModalName } from "@src/enums/components";
import { useModalStore } from "@src/store";
import { newOrganizationSchema } from "@validations";

import { Button, ErrorMessage, Input, Typography } from "@components/atoms";
import { CreateNewOrganizationModal } from "@components/organisms/settings/organization";

type FormValues = z.infer<typeof newOrganizationSchema>;

export const NewOrganization = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization" });
	const {
		formState: { errors },
		handleSubmit,
		register,
	} = useForm<FormValues>({
		resolver: zodResolver(newOrganizationSchema),
		mode: "onSubmit",
	});
	const { openModal } = useModalStore();

	const onSubmit = async (values: FormValues) => {
		openModal(ModalName.createNewOrganization, { orgName: values.orgName });
	};

	return (
		<div>
			<Typography className="mb-4 font-bold" element="h2" size="xl">
				{t("createNewOrganization")}
			</Typography>
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
				<div className="relative mb-3">
					<Input
						isError={!!errors.displayName}
						label={t("form.displayedName")}
						{...register("displayName")}
						isRequired
					/>

					<ErrorMessage>{errors?.displayName?.message as string}</ErrorMessage>
				</div>
				<Button
					className="ml-auto w-fit border-black bg-white px-5 text-base font-medium hover:bg-gray-950 hover:text-white"
					type="submit"
					variant="outline"
				>
					{t("form.buttons.create")}
				</Button>
			</form>
			<CreateNewOrganizationModal />
		</div>
	);
};

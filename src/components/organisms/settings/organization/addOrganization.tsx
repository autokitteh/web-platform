import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { OrganizationsService } from "@services";
import { ModalName } from "@src/enums/components";
import { useModalStore, useToastStore } from "@src/store";
import { addOrganizationSchema } from "@validations";

import { Button, ErrorMessage, Input, Loader, Typography } from "@components/atoms";
import { OrganizationCreatedModal } from "@components/organisms/settings/organization";

type FormValues = z.infer<typeof addOrganizationSchema>;

export const AddOrganization = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("settings", { keyPrefix: "organization" });
	const addToast = useToastStore((state) => state.addToast);
	const [creatingOrganization, setCreatingOrganization] = useState(false);

	const {
		formState: { errors },
		handleSubmit,
		register,
	} = useForm<FormValues>({
		resolver: zodResolver(addOrganizationSchema),
		mode: "onSubmit",
	});
	const { openModal } = useModalStore();

	const onSubmit = async (values: FormValues) => {
		setCreatingOrganization(true);
		const error = await OrganizationsService.create(values.name);
		if (error) {
			addToast({
				message: tErrors("errorCreateNewOrganization"),
				type: "error",
			});

			return;
		}
		openModal(ModalName.organizationCreated, { name: values.name });
		setCreatingOrganization(false);
	};

	return (
		<div>
			<Typography className="mb-9 font-bold" element="h2" size="xl">
				{t("createNewOrganization")}
			</Typography>
			<form className="w-1/2" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative mb-6">
					<Input
						isError={!!errors.name}
						isRequired
						label={t("form.organizationName")}
						{...register("name")}
					/>

					<ErrorMessage>{errors?.name?.message as string}</ErrorMessage>
				</div>
				<Button
					className="ml-auto w-fit border-black bg-white px-5 text-base font-medium hover:bg-gray-950 hover:text-white"
					disabled={creatingOrganization}
					type="submit"
					variant="outline"
				>
					{creatingOrganization ? <Loader size="sm" /> : null}
					{t("form.buttons.create")}
				</Button>
			</form>
			<OrganizationCreatedModal />
		</div>
	);
};

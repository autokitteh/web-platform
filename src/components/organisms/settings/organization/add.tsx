import React, { useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { addOrganizationSchema } from "@validations";

import { Button, ErrorMessage, Input, Loader, Typography } from "@components/atoms";
import { OrganizationPostCreationModal } from "@components/organisms/settings/organization";

type FormValues = z.infer<typeof addOrganizationSchema>;

export const AddOrganization = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("settings", { keyPrefix: "organization" });
	const addToast = useToastStore((state) => state.addToast);
	const { createOrganization, isLoading, organizations } = useOrganizationStore();
	const organizationsNamesSet = useMemo(
		() => new Set((Object.values(organizations) || []).map((organization) => organization.displayName)),
		[organizations]
	);

	const {
		formState: { errors },
		handleSubmit,
		register,
	} = useForm<FormValues>({
		resolver: zodResolver(addOrganizationSchema),
		mode: "onSubmit",
	});

	const validateOrganizationName = (value: string) => {
		if (organizationsNamesSet.has(value)) {
			return t("form.errors.nameTaken");
		}
		if (!new RegExp("^[a-zA-Z_][\\w]*$").test(value)) {
			return t("form.errors.invalidName");
		}
	};

	const { openModal } = useModalStore();

	const onSubmit = async (values: FormValues) => {
		const { data: organizationId, error } = await createOrganization(values.name);
		if (error) {
			addToast({
				message: tErrors("errorCreateNewOrganization"),
				type: "error",
			});

			return;
		}
		openModal(ModalName.organizationCreated, { name: values.name, organizationId });
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
						{...register("name", {
							required: t("nameRequired"),
							validate: validateOrganizationName,
						})}
					/>

					<ErrorMessage>{errors?.name?.message as string}</ErrorMessage>
				</div>
				<Button
					className="ml-auto w-fit border-black bg-white px-5 text-base font-medium hover:bg-gray-950 hover:text-white"
					disabled={isLoading.organizations}
					type="submit"
					variant="outline"
				>
					{isLoading.organizations ? <Loader size="sm" /> : null}
					{t("form.buttons.create")}
				</Button>
			</form>
			<OrganizationPostCreationModal />
		</div>
	);
};

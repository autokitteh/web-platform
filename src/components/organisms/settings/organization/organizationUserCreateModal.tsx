import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { useModalStore } from "@src/store";
import { newOrganizationUserSchema } from "@validations";

import { Button, ErrorMessage, Input } from "@components/atoms";
import { Modal } from "@components/molecules";

export const OrganizationUserCreateModal = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization.modal" });
	const { closeModal } = useModalStore();

	const {
		formState: { errors },
		handleSubmit,
		register,
	} = useForm({
		resolver: zodResolver(newOrganizationUserSchema),
		mode: "onSubmit",
	});

	const onSubmit = async () => {};

	return (
		<Modal hideCloseButton name={ModalName.organizationUserCreate}>
			<h3 className="mb-5 text-xl font-bold">{t("addUser")}</h3>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="relative mb-5">
					<Input
						variant="light"
						{...register("name")}
						aria-label={t("form.name")}
						isError={!!errors.name}
						isRequired
						label={t("form.name")}
					/>
					<ErrorMessage>{errors.name?.message as string}</ErrorMessage>
				</div>
				<div className="relative mb-5">
					<Input
						variant="light"
						{...register("email")}
						aria-label={t("form.email")}
						isError={!!errors.email}
						isRequired
						label={t("form.email")}
					/>
					<ErrorMessage>{errors.email?.message as string}</ErrorMessage>
				</div>
				<div className="mt-8 flex w-full justify-end gap-2">
					<Button
						ariaLabel={t("buttons.cancel")}
						className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
						onClick={() => closeModal(ModalName.organizationUserCreate)}
						variant="outline"
					>
						{t("buttons.cancel")}
					</Button>
					<Button
						ariaLabel={t("buttons.create")}
						className="bg-gray-1100 px-4 py-3 font-semibold"
						type="submit"
						variant="filled"
					>
						{t("buttons.create")}
					</Button>
				</div>
			</form>
		</Modal>
	);
};

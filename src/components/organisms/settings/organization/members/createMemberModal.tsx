import React, { forwardRef, useImperativeHandle } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { CreateMemberModalProps, CreateMemberModalRef } from "@src/interfaces/components";
import { useModalStore } from "@src/store";
import { addOrganizationMemberSchema } from "@validations";

import { Button, ErrorMessage, Loader, Input } from "@components/atoms";
import { Modal } from "@components/molecules";

export const CreateMemberModal = forwardRef<CreateMemberModalRef, CreateMemberModalProps>(
	({ createMember, isCreating, membersEmails }, ref) => {
		const { t } = useTranslation("settings", { keyPrefix: "organization.modal" });
		const { closeModal } = useModalStore();

		const {
			formState: { errors },
			handleSubmit,
			register,
			reset,
		} = useForm<{ email: string }>({
			resolver: zodResolver(addOrganizationMemberSchema),
			mode: "onSubmit",
		});

		const resetForm = () => reset();

		useImperativeHandle(ref, () => ({
			resetForm,
		}));

		const validateMemberEmail = (value: string) => {
			if (membersEmails.has(value)) {
				return t("form.errors.memberWithThisEmailExists");
			}
		};

		const onSubmit = async (data: { email: string }) => {
			const { email } = data;
			createMember(email);
			reset();
		};

		return (
			<Modal hideCloseButton name={ModalName.organizationMemberCreate}>
				<h3 className="mb-5 text-xl font-bold">{t("addMember")}</h3>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="relative mb-5">
						<Input
							variant="light"
							{...register("email", { validate: validateMemberEmail })}
							aria-label={t("form.email")}
							disabled={isCreating}
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
							disabled={isCreating}
							onClick={() => closeModal(ModalName.organizationMemberCreate)}
							variant="outline"
						>
							{t("buttons.cancel")}
						</Button>
						<Button
							ariaLabel={t("buttons.create")}
							className="bg-gray-1100 px-4 py-3 font-semibold"
							disabled={isCreating}
							type="submit"
							variant="filled"
						>
							{isCreating ? <Loader className="mr-1" size="sm" /> : null}
							{t("buttons.create")}
						</Button>
					</div>
				</form>
			</Modal>
		);
	}
);

CreateMemberModal.displayName = "CreateMemberModal";

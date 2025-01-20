import React, { useState } from "react";

import debounce from "lodash/debounce";
import { useTranslation } from "react-i18next";

import { version } from "@constants";
import { ModalName } from "@enums/components";
import { LocalStorageKeys } from "@src/enums";
import { User } from "@src/types/models";
import { getPreference, isNameEmpty, setPreference } from "@src/utilities";

import { useModalStore, useOrganizationStore } from "@store";

import { Button, Checkbox, ErrorMessage, Input, SuccessMessage, Typography } from "@components/atoms";
import { DeleteAccountModal } from "@components/organisms/settings/user";

import { TrashIcon } from "@assets/image/icons";

export const Profile = () => {
	const { t } = useTranslation("settings", { keyPrefix: "profile" });
	const { user, updateUserName } = useOrganizationStore();
	const { closeModal, openModal } = useModalStore();
	const codeAutoSave = getPreference(LocalStorageKeys.autoSave);
	const [codeAutoSaveChecked, setCodeAutoSaveChecked] = useState(!!codeAutoSave);
	const [nameError, setNameError] = useState("");
	const [displaySuccess, setDisplaySuccess] = useState(false);

	const onDeleteAccount = () => {
		closeModal(ModalName.deleteAccount);
	};

	const handleDeleteAccountClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		openModal(ModalName.deleteAccount, {});
	};

	const handleCodeAutoSaveChange = (checked: boolean) => {
		setPreference(LocalStorageKeys.autoSave, checked);
		setCodeAutoSaveChecked(checked);
	};

	const renameUser = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setNameError("");
		const displayName = event.target.value;
		const nameValidationError = isNameEmpty(displayName);
		if (nameValidationError) {
			setNameError(nameValidationError);
			return;
		}
		const { error } = await updateUserName({ ...user, name: displayName } as User);
		if (error) {
			setNameError(t("errors.updateNameFailed"));
			return;
		}
		setDisplaySuccess(true);
		setTimeout(() => {
			setDisplaySuccess(false);
		}, 3000);
	};
	const debouncedRename = debounce(renameUser, 2000);

	return (
		<div className="flex h-full w-3/4 flex-col font-averta">
			<Typography className="mb-6 font-bold" element="h1" size="2xl">
				{t("title")}
			</Typography>
			<div className="mb-6">
				<Input
					inputLabelTextSize="text-base"
					isError={!!nameError}
					label={t("name")}
					onChange={debouncedRename}
					value={user?.name}
				/>

				<div className="h-6">
					<ErrorMessage>{nameError as string}</ErrorMessage>
					{displaySuccess ? <SuccessMessage>{t("messages.nameUpdatedSuccessfully")}</SuccessMessage> : null}
				</div>
			</div>
			<div>
				<Input disabled inputLabelTextSize="text-base" label={t("email")} value={user?.email} />
			</div>
			<Typography className="mt-9" element="p">
				{t("retentionPolicyTitle")}
			</Typography>
			<Typography className="mt-1.5" element="p" size="1.5xl">
				{t("retentionPolicyDescription")}
			</Typography>
			<Typography className="mt-9" element="p">
				{t("codeAutoSaveTitle")}
			</Typography>
			<Typography className="mt-1.5" element="p" size="1.5xl">
				<Checkbox
					checked={!!codeAutoSaveChecked}
					className="-ml-2"
					isLoading={false}
					label={t("codeAutoSaveLabel")}
					labelClassName="text-1.5xl"
					onChange={handleCodeAutoSaveChange}
				/>
			</Typography>
			<div className="mt-9">
				<Button
					className="gap-3 px-4 text-base font-semibold text-white"
					onClick={handleDeleteAccountClick}
					variant="outline"
				>
					<TrashIcon className="size-4 stroke-white" />
					{t("deleteAccount")}
				</Button>
			</div>
			<div className="h-full" />
			<div className="mb-1 flex items-end text-xs text-white">Version: v{version}</div>
			<DeleteAccountModal onDelete={onDeleteAccount} />
		</div>
	);
};

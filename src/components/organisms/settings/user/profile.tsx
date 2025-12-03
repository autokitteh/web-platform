import React, { useState } from "react";

import { debounce } from "radash";
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
	const { t: luckyOrangeTranslations } = useTranslation("settings", {
		keyPrefix: "profile.luckyOrangeCookieConsent",
	});

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
	const debouncedRename = debounce({ delay: 2000 }, renameUser);

	return (
		<div className="flex h-full w-3/4 flex-col font-averta">
			<Typography className="mb-7 font-bold" element="h1" size="2xl">
				{t("title")}
			</Typography>
			<div className="mb-7">
				<Input
					inputLabelTextSize="text-base"
					isError={!!nameError}
					label={t("name")}
					onChange={debouncedRename}
					value={user?.name}
				/>

				<div className="h-7">
					<ErrorMessage>{nameError as string}</ErrorMessage>
					{displaySuccess ? <SuccessMessage>{t("messages.nameUpdatedSuccessfully")}</SuccessMessage> : null}
				</div>
			</div>
			<div>
				<Input disabled inputLabelTextSize="text-base" label={t("email")} value={user?.email} />
			</div>
			<Typography className="mt-7 font-semibold" element="p">
				{t("retentionPolicyTitle")}
			</Typography>
			<Typography className="mt-1.5" element="p" size="medium">
				{t("retentionPolicyDescription")}
			</Typography>
			<Typography className="mt-7 font-semibold" element="p">
				{t("codeAutoSaveTitle")}
			</Typography>
			<Typography className="mt-1.5" element="p" size="medium">
				<Checkbox
					checked={!!codeAutoSaveChecked}
					className="-ml-2"
					isLoading={false}
					label={t("codeAutoSaveLabel")}
					labelClassName="text-base"
					onChange={handleCodeAutoSaveChange}
				/>
			</Typography>
			<div className="my-4 border-t-0.5 border-gray-900" />

			<Typography className="mb-2 font-semibold" element="p">
				{luckyOrangeTranslations("title")}
			</Typography>
			<Typography className="mt-1.5" element="p" size="medium">
				{luckyOrangeTranslations("description")}
			</Typography>
			<Typography className="mt-1.5" element="p" size="medium">
				{luckyOrangeTranslations("privacyLearnMore")}
				<Button
					className="inline text-white underline hover:bg-transparent hover:text-green-800"
					href={luckyOrangeTranslations("privacyPolicyLink")}
					target="_blank"
				>
					{luckyOrangeTranslations("privacyPolicyLink")}
				</Button>
			</Typography>
			<Typography className="mt-1.5" element="p" size="medium">
				{luckyOrangeTranslations("optOutText")}
				<Button
					className="inline text-white underline hover:bg-transparent hover:text-green-800"
					href={luckyOrangeTranslations("optOutLink")}
					target="_blank"
				>
					{luckyOrangeTranslations("optOutLink")}
				</Button>
			</Typography>
			<div className="mt-7">
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
			<div className="mb-2 mt-5 flex items-end text-xs text-white">Version: v{version}</div>
			<DeleteAccountModal onDelete={onDeleteAccount} />
		</div>
	);
};

import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { version } from "@constants";
import { ModalName } from "@enums/components";

import { useModalStore, useToastStore, useUserStore } from "@store";

import { Button, Checkbox, Typography } from "@components/atoms";
import { DeleteAccountModal } from "@components/organisms/settings/profile";

import { TrashIcon } from "@assets/image/icons";

export const Profile = () => {
	const { t } = useTranslation("settings", { keyPrefix: "profile" });
	const { getLoggedInUser, user } = useUserStore();
	const { closeModal, openModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const codeManualSave = localStorage.getItem("codeManualSave") === "true";
	const [codeManualSaveChecked, setcodeManualSaveChecked] = useState(!!codeManualSave);

	const loadUser = async () => {
		const error = await getLoggedInUser();
		if (error) {
			addToast({
				message: t("accountFetchError", { error }),
				type: "error",
			});
		}
	};

	useEffect(() => {
		if (!user) {
			loadUser();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onDeleteAccount = () => {
		closeModal(ModalName.deleteAccount);
	};

	const handleDeleteAccountClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		openModal(ModalName.deleteAccount, {});
	};

	const handleCodeManualSaveChange = (checked: boolean) => {
		localStorage.setItem("codeManualSave", checked.toString());
		setcodeManualSaveChecked(checked);
	};

	return (
		<div className="flex h-full flex-col font-averta">
			<Typography className="mb-9 font-bold" element="h1" size="2xl">
				{t("title")}
			</Typography>
			<Typography className="mb-1.5 font-fira-sans opacity-90" element="p">
				{t("name")}
			</Typography>
			<Typography className="mb-9" element="p" size="1.5xl">
				{user?.name}
			</Typography>
			<Typography className="mb-1.5 font-fira-sans opacity-90" element="p">
				{t("email")}
			</Typography>
			<Typography element="p" size="1.5xl">
				{user?.email}
			</Typography>
			<Typography className="mt-9" element="p">
				{t("retentionPolicyTitle")}
			</Typography>
			<Typography className="mt-1.5" element="p" size="1.5xl">
				{t("retentionPolicyDescription")}
			</Typography>
			<Typography className="mt-9" element="p">
				{t("codeManualSaveTitle")}
			</Typography>
			<Typography className="mt-1.5" element="p" size="1.5xl">
				<Checkbox
					checked={!!codeManualSaveChecked}
					className="-ml-2"
					isLoading={false}
					label={t("codeManualSaveDescription")}
					labelClassName="text-1.5xl"
					onChange={handleCodeManualSaveChange}
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

import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@src/enums/components";
import { useModalStore, useToastStore, useUserStore } from "@src/store";

import { Button, Typography } from "@components/atoms";
import { DeleteAccountModal } from "@components/organisms/settings/profile";

import { TrashIcon } from "@assets/image/icons";

export const Profile = () => {
	const { t } = useTranslation("settings", { keyPrefix: "profile" });
	const { getLoggedInUser, user } = useUserStore();
	const { closeModal, openModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);

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

	return (
		<div className="font-averta">
			<Typography className="mb-9 text-2xl font-bold" element="h1" size="large">
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
			<DeleteAccountModal onDelete={onDeleteAccount} />
		</div>
	);
};

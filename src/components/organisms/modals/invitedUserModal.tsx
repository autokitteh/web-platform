import React from "react";

import { useTranslation } from "react-i18next";

import { MemberStatusType } from "@enums";
import { ModalName } from "@enums/components";

import { useModalStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const InvitedUserModal = ({
	onUserInvintaionAction,
}: {
	onUserInvintaionAction: (status: MemberStatusType, organizationId: string) => void;
}) => {
	const { t } = useTranslation("modals", { keyPrefix: "invitedUser" });
	const data = useModalStore((state) => state.data) as {
		organizationId: string;
		organizationName: string;
	};

	return (
		<Modal className="w-1/2 max-w-550 p-5" name={ModalName.invitedUser}>
			<h3 className="text-xl font-bold">{t("title")}</h3>
			<p className="mb-5 mt-1 text-base font-medium">{t("content", { name: data?.organizationName })}</p>
			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("declineButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => onUserInvintaionAction(MemberStatusType.declined, data?.organizationId)}
					variant="outline"
				>
					{t("declineButton")}
				</Button>
				<Button
					ariaLabel={t("acceptButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold"
					onClick={() => onUserInvintaionAction(MemberStatusType.active, data?.organizationId)}
					type="submit"
					variant="filled"
				>
					{t("acceptButton")}
				</Button>
			</div>
		</Modal>
	);
};

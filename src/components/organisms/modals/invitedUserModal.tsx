import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { MemberStatusType } from "@src/enums";
import { useModalStore } from "@src/store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const InvitedUserModal = ({
	handleUpdateMemberStatus,
}: {
	handleUpdateMemberStatus: (organizationId: string, status: MemberStatusType) => void;
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
					onClick={() => handleUpdateMemberStatus(data.organizationId, MemberStatusType.declined)}
					variant="outline"
				>
					{t("declineButton")}
				</Button>
				<Button
					ariaLabel={t("acceptButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold"
					onClick={() => handleUpdateMemberStatus(data.organizationId, MemberStatusType.active)}
					type="submit"
					variant="filled"
				>
					{t("acceptButton")}
				</Button>
			</div>
		</Modal>
	);
};

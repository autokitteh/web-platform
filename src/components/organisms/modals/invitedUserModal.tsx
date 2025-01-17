import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName } from "@enums/components";
import { OrganizationsService } from "@services";
import { MemberStatusType } from "@src/enums";
import { useModalStore, useToastStore, useUserStore } from "@src/store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const InvitedUserModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "invitedUser" });
	const data = useModalStore((state) => state.data) as { organizationId: string; organizationName: string };
	const user = useUserStore((state) => state.user);
	const addToast = useToastStore((state) => state.addToast);
	const navigate = useNavigate();

	const handleUpdateMemberStatus = async (status: MemberStatusType) => {
		if (!data?.organizationId || !user?.id) return;

		const { error } = await OrganizationsService.updateMember(data.organizationId, user.id, status);
		if (error) {
			addToast({
				message: t("failedUpdateOrganizationStatus"),
				type: "error",
			});

			return;
		}
		if (status === MemberStatusType.active) {
			navigate(`/switch-organization/${data.organizationId}`);
		}
	};

	return (
		<Modal className="w-1/2 max-w-550 p-5" name={ModalName.invitedUser}>
			<h3 className="text-xl font-bold">{t("title")}</h3>
			<p className="mb-5 mt-1 text-base font-medium">{t("content", { name: data?.organizationName })}</p>
			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("declineButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => handleUpdateMemberStatus(MemberStatusType.declined)}
					variant="outline"
				>
					{t("declineButton")}
				</Button>
				<Button
					ariaLabel={t("acceptButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold"
					onClick={() => handleUpdateMemberStatus(MemberStatusType.active)}
					type="submit"
					variant="filled"
				>
					{t("acceptButton")}
				</Button>
			</div>
		</Modal>
	);
};

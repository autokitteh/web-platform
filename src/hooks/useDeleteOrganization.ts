import { useState } from "react";

import omit from "lodash/omit";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LoggerService, ProjectsService } from "@services";
import { namespaces } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore } from "@src/store";
import { EnrichedOrganization } from "@src/types/models";

export const useDeleteOrganization = () => {
	const [organizationIdInDeletion, setOrganizationIdInDeletion] = useState<string>();
	const { closeModal } = useModalStore();
	const { currentOrganization, user, deleteOrganization, logoutFunction } = useOrganizationStore();
	const { t } = useTranslation("settings", { keyPrefix: "userOrganizations" });
	const navigate = useNavigate();

	const onDelete = async (organization: EnrichedOrganization) => {
		const deletingCurrentOrganization = organization.id === currentOrganization?.id;

		const { error } = await deleteOrganization(omit(organization, "currentMember"));
		closeModal(ModalName.deleteOrganization);
		if (error) {
			return { error: true };
		}

		if (!deletingCurrentOrganization) return { error: false };
		setTimeout(async () => {
			if (!user?.defaultOrganizationId) {
				LoggerService.error(
					namespaces.ui.organizationTableUserSettings,
					t("errors.defaultOrganizationIdMissing", { userId: user?.id })
				);
				logoutFunction(true);
				return;
			}
			navigate(`/switch-organization/${user.defaultOrganizationId}`);
		}, 3000);
		return { error: false };
	};

	const handleDeleteOrganization = async (organization: EnrichedOrganization) => {
		setOrganizationIdInDeletion(organization.id);

		try {
			const { data: orgProjectList, error } = await ProjectsService.list(organization.id);

			if (error || !orgProjectList) {
				return {
					status: "error",
					organization,
				};
			}

			const hasProjects = orgProjectList?.length > 0;
			return {
				status: "success",
				action: hasProjects ? "show_warning" : "resume_delete",
				organization,
			};
		} finally {
			setOrganizationIdInDeletion(undefined);
		}
	};

	return { organizationIdInDeletion, onDelete, handleDeleteOrganization };
};

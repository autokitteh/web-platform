import { useState } from "react";

import omit from "lodash/omit";
import { useTranslation } from "react-i18next";

import { LoggerService, ProjectsService } from "@services";
import { namespaces } from "@src/constants";
import { useOrganizationStore } from "@src/store";
import { EnrichedOrganization } from "@src/types/models";

export const useDeleteOrganization = () => {
	const [organizationIdInDeletion, setOrganizationIdInDeletion] = useState<string>();
	const { user, deleteOrganization } = useOrganizationStore();
	const { t } = useTranslation("settings", { keyPrefix: "userOrganizations" });

	const onDelete = async (organization: EnrichedOrganization) => {
		const { error } = await deleteOrganization(omit(organization, "currentMember"));
		if (error) return { error: true };

		if (!user?.defaultOrganizationId) {
			LoggerService.error(
				namespaces.ui.organizationTableUserSettings,
				t("errors.defaultOrganizationIdMissing", { userId: user?.id })
			);
		}

		return { error: false };
	};

	const handleDeleteOrganization = async (organizationId: string) => {
		setOrganizationIdInDeletion(organizationId);

		try {
			const { data: orgProjectList, error } = await ProjectsService.list(organizationId);

			if (error || !orgProjectList) {
				return {
					status: "error",
				};
			}

			const hasProjects = orgProjectList?.length > 0;
			return {
				status: "success",
				action: hasProjects ? "show_warning" : "resume_delete",
			};
		} finally {
			setOrganizationIdInDeletion(undefined);
		}
	};

	return { organizationIdInDeletion, onDelete, handleDeleteOrganization };
};

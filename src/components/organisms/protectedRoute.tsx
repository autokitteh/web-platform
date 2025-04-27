import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { MemberRole } from "@enums";

import { useOrganizationStore } from "@store";

export const ProtectedRoute = ({ children, allowedRole }: { allowedRole: MemberRole[]; children: React.ReactNode }) => {
	const { getCurrentOrganizationEnriched } = useOrganizationStore();
	const { data: currentOrganization, error } = getCurrentOrganizationEnriched();
	const navigate = useNavigate();
	const { t } = useTranslation("components", { keyPrefix: "protectedRoute" });

	if (error || !currentOrganization?.currentMember?.role) {
		navigate("/error", { state: { error: t("errors.couldntGetUserOrganization") } });
		return;
	}

	if (!allowedRole.includes(currentOrganization.currentMember.role)) {
		navigate("/error", { state: { error: t("errors.accessForbidden") } });
		return;
	}

	return children;
};

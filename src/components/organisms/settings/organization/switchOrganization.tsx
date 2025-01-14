import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { useOrganizationStore, useProjectStore } from "@src/store";

import { Loader } from "@components/atoms";

export const SwitchOrganization = () => {
	const { t } = useTranslation("errors");
	const { organizationId } = useParams();
	const [isProcessing, setIsProcessing] = useState(true);
	const { organizationsList, setCurrentOrganizationId } = useOrganizationStore();
	const { getProjectsList } = useProjectStore();
	const navigate = useNavigate();

	const currentOrganization = useMemo(
		() => organizationsList?.find((organization) => organization.orgId === organizationId),
		[organizationId, organizationsList]
	);

	const switchProjectList = useCallback(async () => {
		try {
			if (organizationId) {
				await getProjectsList(organizationId);
			}
		} finally {
			setIsProcessing(false);
		}
	}, [organizationId, getProjectsList]);

	useEffect(() => {
		if (organizationId && currentOrganization) {
			setCurrentOrganizationId(organizationId);
			switchProjectList();
		} else if (!currentOrganization) {
			navigate("/error", { state: { error: t("organizationNotFound") } });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [organizationId, currentOrganization]);

	if (isProcessing) {
		return <Loader isCenter size="lg" />;
	}

	return <Navigate state={{ organizationId }} to="/" />;
};

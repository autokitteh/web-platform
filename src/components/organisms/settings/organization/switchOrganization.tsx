import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { useOrganizationStore, useProjectStore } from "@src/store";

import { Loader } from "@components/atoms";

export const SwitchOrganization = () => {
	const { t } = useTranslation("errors");
	const { organizationId } = useParams();
	const [isProcessing, setIsProcessing] = useState(true);
	const { organizationsList, setCurrentOrganization } = useOrganizationStore();
	const { getProjectsList } = useProjectStore();
	const navigate = useNavigate();

	const currentOrganization = useMemo(
		() => organizationsList?.find((organization) => organization.id === organizationId),
		[organizationId, organizationsList]
	);

	const switchProjectList = useCallback(async () => {
		await getProjectsList();
		setIsProcessing(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [organizationId]);

	useEffect(() => {
		if (organizationId && currentOrganization) {
			setCurrentOrganization(currentOrganization);
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

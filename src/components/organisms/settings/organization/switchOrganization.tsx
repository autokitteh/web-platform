import React, { useEffect } from "react";

import { Navigate, useParams } from "react-router-dom";

import { useOrganizationStore } from "@src/store";

export const SwitchOrganization = () => {
	const { organizationId } = useParams();
	const { getCurrentOrganizationId } = useOrganizationStore();

	useEffect(() => {
		if (organizationId) {
			getCurrentOrganizationId(organizationId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [organizationId]);

	return <Navigate state={{ organizationId }} to="/" />;
};

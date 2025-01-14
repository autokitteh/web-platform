import React, { useEffect } from "react";

import { Navigate, useParams } from "react-router-dom";

import { useOrganizationStore } from "@src/store";

export const SwitchOrganization = () => {
	const { organizationId } = useParams();
	const { setCurrentOrganizationId } = useOrganizationStore();

	useEffect(() => {
		if (organizationId) {
			setCurrentOrganizationId(organizationId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <Navigate state={{ organizationId }} to="/" />;
};

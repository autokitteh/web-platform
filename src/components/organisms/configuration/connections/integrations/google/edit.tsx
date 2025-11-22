import React from "react";

import { GoogleIntegrationType } from "@src/types";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const GoogleIntegrationEditForm = ({
	googleIntegrationApplication,
}: {
	googleIntegrationApplication: GoogleIntegrationType;
}) => <IntegrationEditForm integrationType={googleIntegrationApplication} />;

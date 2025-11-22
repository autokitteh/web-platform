import React from "react";

import { Integrations } from "@src/enums/components";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const ConfluenceIntegrationEditForm = () => <IntegrationEditForm integrationType={Integrations.confluence} />;

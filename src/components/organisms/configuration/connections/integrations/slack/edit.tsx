import React from "react";

import { Integrations } from "@src/enums/components";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const SlackIntegrationEditForm = () => <IntegrationEditForm integrationType={Integrations.slack} />;

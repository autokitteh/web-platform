import { fitleredIntegrationsMap } from "@enums";
import { SelectOption } from "@interfaces/components";
import { sortIntegrationsMapByLabel } from "@src/utilities";

const sortedIntegrationsMap = sortIntegrationsMapByLabel(fitleredIntegrationsMap);
export const integrationTypes: SelectOption[] = Object.values(sortedIntegrationsMap);

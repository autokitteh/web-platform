import { Integration as ProtoIntegration } from "@ak-proto-ts/integrations/v1/integration_pb";
import { integrationIcons } from "@src/constants/lists/connections";
import { stripGoogleConnectionName } from "@src/utilities";
import { Integration } from "@type/models";

/**
 * Converts a ProtoIntegration object to a IntegrationType object.
 * @param protoIntegration The ProtoIntegration object to convert.
 * @returns The IntegrationType object.
 */
export function convertIntegrationProtoToModel(protoIntegration: ProtoIntegration): Integration {
	const strippedIntegrationName = stripGoogleConnectionName(protoIntegration.uniqueName || "");
	const icon = integrationIcons[strippedIntegrationName];

	return {
		displayName: protoIntegration.displayName,
		integrationId: protoIntegration.integrationId,
		uniqueName: protoIntegration.uniqueName,
		icon,
	};
}

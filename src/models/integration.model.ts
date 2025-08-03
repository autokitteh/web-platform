import { Integration as ProtoIntegration } from "@ak-proto-ts/integrations/v1/integration_pb";
import { Integration } from "@type/models";

export function convertIntegrationProtoToModel(protoIntegration: ProtoIntegration): Integration {
	return {
		displayName: protoIntegration.displayName,
		integrationId: protoIntegration.integrationId,
		uniqueName: protoIntegration.uniqueName,
	};
}

import { Deployment } from "@types/models";

import { Deployment as ProtoDeployment } from "@ak-proto-ts/deployments/v1/deployment_pb";
import { sessionStateConverter } from "@models/utils/sessionsStateConverter.utils";
import { convertTimestampToDate } from "@utilities";

/**
 * Converts a ProtoDeployment object to a TypeScript Deployment object.
 *
 * @param {ProtoDeployment} protoDeployment - The ProtoDeployment object to convert.
 * @returns {Deployment} The converted TypeScript Deployment object.
 */
export const convertDeploymentProtoToModel = (protoDeployment: ProtoDeployment): Deployment => {
	return {
		buildId: protoDeployment.buildId,
		createdAt: convertTimestampToDate(protoDeployment.createdAt!),
		deploymentId: protoDeployment.deploymentId,
		sessionStats: protoDeployment.sessionsStats.map((sessionStat) => ({
			count: sessionStat.count,
			state: sessionStateConverter(sessionStat.state),
		})),
		state: protoDeployment.state,
	};
};

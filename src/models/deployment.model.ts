import { Deployment as ProtoDeployment } from "@ak-proto-ts/deployments/v1/deployment_pb";
import { sessionStateConverter } from "@models/utils/sessionsStateConverter.utils";
import { Deployment } from "@type/models";
import { convertTimestampToDate } from "@utilities";

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

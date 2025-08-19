import { Project as ProtoProject } from "@ak-proto-ts/projects/v1/project_pb";
import { Project } from "@type/models/project.type";

export const convertProjectProtoToModel = (protoProject: ProtoProject): Project => {
	return {
		id: protoProject.projectId,
		name: protoProject.name,
		organizationId: protoProject.orgId,
	};
};

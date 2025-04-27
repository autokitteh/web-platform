import { Project as ProtoProject } from "@ak-proto-ts/projects/v1/project_pb";
import { Project } from "@type/models/project.type";

/**
 * Converts a ProtoProject object to a TypeScript Project object.
 *
 * @param {ProtoProject} protoProject - The ProtoProject object to convert.
 * @returns {Project} The converted TypeScript Project object.
 */

export const convertProjectProtoToModel = (protoProject: ProtoProject): Project => {
	return {
		id: protoProject.projectId,
		name: protoProject.name,
		organizationId: protoProject.orgId,
	};
};

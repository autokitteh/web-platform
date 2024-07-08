import { Project as ProtoProject } from "@ak-proto-ts/projects/v1/project_pb";
import { SidebarHrefMenu } from "@enums/components";
import { Project, ProjectMenuItem } from "@type/models/project.type";

/**
 * Converts a ProtoProject object to a TypeScript Project object.
 *
 * @param {ProtoProject} protoProject - The ProtoProject object to convert.
 * @returns {Project} The converted TypeScript Project object.
 */
export const convertProjectProtoToModel = (protoProject: ProtoProject): Project => {
	return {
		name: protoProject.name,
		projectId: protoProject.projectId,
	};
};

export const convertProtoProjectToMenuItemModel = (protoProject: Project): ProjectMenuItem => {
	return {
		href: `/${SidebarHrefMenu.projects}/${protoProject.projectId}`,
		id: protoProject.projectId,
		name: protoProject.name,
	};
};

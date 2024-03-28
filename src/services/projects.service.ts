import { SetResourcesResponse } from "@ak-proto-ts/projects/v1/svc_pb";
import { projectsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertProjectProtoToModel } from "@models";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Project } from "@type/models";
import i18n from "i18next";

export class ProjectsService {
	static async create(projectName: string): Promise<ServiceResponse<string>> {
		try {
			const { projectId } = await projectsClient.create({
				project: {
					name: projectName,
				},
			});
			if (!projectId) {
				LoggerService.error(namespaces.projectService, i18n.t("errors.projectNotCreated"));

				return { data: undefined, error: i18n.t("errors.projectNotCreated") };
			}
			return { data: projectId, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async get(projectId: string): Promise<ServiceResponse<Project>> {
		try {
			const { project } = await projectsClient.get({ projectId });
			if (!project) {
				LoggerService.error(namespaces.projectService, i18n.t("errors.projectNotFound"));

				return { data: undefined, error: i18n.t("errors.projectNotFound") };
			}
			return { data: project, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async update(projectId: string, name: string): Promise<ServiceResponse<void>> {
		try {
			const project = await projectsClient.update({ project: { projectId, name } });
			if (!project) {
				LoggerService.error(namespaces.projectService, i18n.t("errors.projectNotFound"));
				return { data: undefined, error: i18n.t("errors.projectNotFound") };
			}
			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async list(): Promise<ServiceResponse<Project[]>> {
		try {
			const projects = (await projectsClient.listForOwner({ ownerId: "" })).projects.map(convertProjectProtoToModel);
			return { data: projects, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async setResources(
		projectId: string,
		resources: Record<string, Uint8Array>
	): Promise<ServiceResponse<SetResourcesResponse>> {
		try {
			await projectsClient.setResources({
				projectId,
				resources,
			});
			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.resourcesService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async getResources(projectId: string): Promise<ServiceResponse<{ [key: string]: Uint8Array }>> {
		try {
			const { resources } = await projectsClient.downloadResources({
				projectId,
			});
			return { data: resources, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.resourcesService, (error as Error).message);
			return { data: undefined, error };
		}
	}
}

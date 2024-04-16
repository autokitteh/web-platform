import { SetResourcesResponse } from "@ak-proto-ts/projects/v1/svc_pb";
import { projectsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertErrorProtoToModel, convertProjectProtoToModel } from "@models";
import { DeploymentsService, EnvironmentsService, LoggerService } from "@services";
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

	static async build(projectId: string, resources: Record<string, Uint8Array>): Promise<ServiceResponse<string>> {
		try {
			await projectsClient.setResources({
				projectId,
				resources,
			});
			const { buildId, error } = await projectsClient.build({ projectId });
			if (error) {
				LoggerService.error(
					`${namespaces.projectService} - Build: `,
					i18n.t("errors.buildProjectError", { projectId, error: error.message })
				);

				return { data: undefined, error };
			}
			return { data: buildId, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.projectService,
				i18n.t("errors.buildProjectError", { projectId, error: (error as Error).message })
			);
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
	static async delete(projectId: string): Promise<ServiceResponse<undefined>> {
		try {
			await projectsClient.delete({ projectId });
			return { data: undefined, error: undefined };
		} catch (error) {
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

	static async build(projectId: string, resources: Record<string, Uint8Array>): Promise<ServiceResponse<string>> {
		try {
			await projectsClient.setResources({
				projectId,
				resources,
			});
			const { buildId, error } = await projectsClient.build({ projectId });
			if (error) {
				LoggerService.error(
					`${namespaces.projectService} - Build: `,
					convertErrorProtoToModel(error.value, projectId).message
				);

				return { data: undefined, error };
			}
			return { data: buildId, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.projectService,
				i18n.t("errors.buildProjectError", { projectId, error: (error as Error).message })
			);
			return { data: undefined, error: (error as Error).message };
		}
	}

	static async getResources(projectId: string): Promise<ServiceResponse<Record<string, Uint8Array>>> {
		try {
			const { resources } = await projectsClient.downloadResources({ projectId });
			return { data: resources, error: undefined };
		} catch (error) {
			return { data: undefined, error: (error as Error).message };
		}
	}

	static async deploy(projectId: string, buildId: string): Promise<ServiceResponse<string>> {
		const { data: environments, error: envError } = await EnvironmentsService.listByProjectId(projectId);
		if (envError) {
			return { data: undefined, error: envError };
		}

		if (!environments?.length) {
			const errorMessage = i18n.t("errors.defaultEnvironmentNotFound");
			LoggerService.error(namespaces.projectService, errorMessage);
			return { data: undefined, error: new Error(errorMessage) };
		}

		const environment = environments[0];

		const { data: deploymentId, error } = await DeploymentsService.create({
			buildId: buildId!,
			envId: environment.envId,
		});

		if (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);
			return { data: undefined, error };
		}

		return { data: deploymentId, error: undefined };
	}

	static async run(projectId: string, resources: Record<string, Uint8Array>): Promise<ServiceResponse<string>> {
		const { data: buildId, error: buildError } = await this.build(projectId, resources);
		if (buildError) {
			return { data: undefined, error: buildError };
		}
		const { data: deploymentId, error } = await this.deploy(projectId, buildId!);
		if (error) {
			LoggerService.error(`${namespaces.projectService} - Deploy`, (error as Error).message);

			return {
				data: undefined,
				error: error,
			};
		}

		const { error: activateError } = await DeploymentsService.activate(deploymentId!);
		if (activateError) {
			LoggerService.error(`${namespaces.projectService} - Activate`, (activateError as Error).message);
			return { data: undefined, error: activateError };
		}
		return { data: deploymentId, error: undefined };
	}
}

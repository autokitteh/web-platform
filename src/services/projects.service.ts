import i18n from "i18next";

import { SetResourcesResponse } from "@ak-proto-ts/projects/v1/svc_pb";
import { manifestApplyClient, projectsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertErrorProtoToModel, convertProjectProtoToModel } from "@models";
import { DeploymentsService, LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Project } from "@type/models";

export class ProjectsService {
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
				i18n.t("buildProjectError", { error: (error as Error).message, ns: "services", projectId })
			);

			return { data: undefined, error };
		}
	}

	static async create(name?: string): Promise<ServiceResponse<string>> {
		try {
			const { projectId } = await projectsClient.create({ project: { name } });
			if (!projectId) {
				LoggerService.error(namespaces.projectService, i18n.t("projectNotCreated", { ns: "services" }));

				return { data: undefined, error: new Error(i18n.t("projectNotCreated", { ns: "services" })) };
			}

			return { data: projectId, error: undefined };
		} catch (error) {
			LoggerService.error(`${namespaces.projectService} - Create: `, (error as Error).message);

			return { data: undefined, error };
		}
	}
	static async delete(projectId: string): Promise<ServiceResponse<undefined>> {
		try {
			await projectsClient.delete({ projectId });

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.projectService,
				i18n.t("projectRemoveFailedExtended", { ns: "services", projectId, error: (error as Error).message })
			);

			return { data: undefined, error };
		}
	}
	static async deploy(projectId: string, buildId: string): Promise<ServiceResponse<string>> {
		const { data: deploymentId, error } = await DeploymentsService.create({
			buildId: buildId!,
			projectId,
		});

		if (error) {
			return { data: undefined, error };
		}

		return { data: deploymentId, error: undefined };
	}

	static async get(projectId: string): Promise<ServiceResponse<Project>> {
		try {
			const { project } = await projectsClient.get({ projectId });
			if (!project) {
				LoggerService.error(namespaces.projectService, i18n.t("projectNotFound", { ns: "services" }));

				return { data: undefined, error: new Error(i18n.t("projectNotFound", { ns: "services" })) };
			}

			return { data: convertProjectProtoToModel(project), error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async getResources(projectId: string): Promise<ServiceResponse<Record<string, Uint8Array>>> {
		try {
			const { resources } = await projectsClient.downloadResources({ projectId });

			return { data: resources, error: undefined };
		} catch (error) {
			return { data: undefined, error };
		}
	}

	static async list(): Promise<ServiceResponse<Project[]>> {
		try {
			const projects = (await projectsClient.list({})).projects.map(convertProjectProtoToModel);

			return { data: projects, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);

			return { data: undefined, error };
		}
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
				error,
			};
		}

		const { error: activateError } = await DeploymentsService.activate(deploymentId!);
		if (activateError) {
			LoggerService.error(`${namespaces.projectService} - Activate`, (activateError as Error).message);

			return { data: undefined, error: activateError };
		}

		return { data: deploymentId, error: undefined };
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

	static async update(projectId: string, name: string): Promise<ServiceResponse<void>> {
		try {
			const project = await projectsClient.update({
				project: { name, projectId },
				fieldMask: { paths: ["name"] },
			});

			if (!project) {
				LoggerService.error(namespaces.projectService, i18n.t("projectNotFound", { ns: "services" }));

				return { data: undefined, error: new Error(i18n.t("projectNotFound", { ns: "services" })) };
			}

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async createFromManifest(manifestYaml: string): Promise<ServiceResponse<string>> {
		try {
			const { projectIds } = await manifestApplyClient.apply({ manifest: manifestYaml, path: "path" });
			if (!projectIds || !projectIds.length) {
				return { data: undefined, error: new Error(i18n.t("projectNameExist", { ns: "services" })) };
			}

			return { data: projectIds[0], error: undefined };
		} catch (error: unknown) {
			LoggerService.error(
				namespaces.projectService,
				`${i18n.t("projectCreationFailedExtended", { error, ns: "services" })}`
			);

			return { data: undefined, error };
		}
	}

	static async export(projectId: string): Promise<ServiceResponse<Uint8Array>> {
		try {
			const { zipArchive: akProjectArchiveZip } = await projectsClient.export({ projectId });

			if (!akProjectArchiveZip) {
				LoggerService.error(namespaces.projectService, i18n.t("fetchExportFailed", { ns: "errors" }));

				return { data: undefined, error: new Error(i18n.t("fetchExportFailed", { ns: "errors" })) };
			}

			return { data: akProjectArchiveZip, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("fetchExportFailedUnexpectedError", {
				ns: "errors",
				error: (error as Error).message,
			});
			LoggerService.error(namespaces.projectService, errorMessage);

			return { data: undefined, error: errorMessage };
		}
	}
}

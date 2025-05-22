import { t } from "i18next";

import { SetResourcesResponse } from "@ak-proto-ts/projects/v1/svc_pb";
import { manifestApplyClient, projectsClient } from "@api/grpc/clients.grpc.api";
import { defaultManifestFileName, namespaces } from "@constants";
import { convertErrorProtoToModel, convertProjectProtoToModel, convertViolationProtoToModel } from "@models";
import { DeploymentsService, LoggerService } from "@services";
import { ErrorCodes } from "@src/enums/errorCodes.enum";
import { convertLintViolationToSystemLog } from "@src/models/lintViolation.model";
import { ServiceResponse } from "@type";
import { LintViolationCheck, Project } from "@type/models";

export class ProjectsService {
	private static async _setResourcesAndLint(
		projectId: string,
		resources: Record<string, Uint8Array>
	): Promise<ServiceResponse<{ warnings: number } | null>> {
		try {
			await projectsClient.setResources({ projectId, resources });
		} catch (error) {
			LoggerService.error(
				`${namespaces.projectService} - SetResources`,
				`Failed to set resources for project ${projectId}: ${(error as Error).message}`
			);
			return { data: null, error };
		}

		const {
			data: lintViolations,
			error: lintError,
			metadata: lintMetadataFromLintCall,
		} = await ProjectsService.lint(projectId!, resources);

		if (lintError) {
			return { data: null, error: lintError, metadata: lintMetadataFromLintCall };
		}

		const isManifestFilePresent = !!resources?.[defaultManifestFileName];

		let warningsCount = 0;
		if (lintViolations?.length) {
			const violationsConvertedToLogs = lintViolations.map((violation) =>
				convertLintViolationToSystemLog(violation, isManifestFilePresent)
			);
			LoggerService.lint(namespaces.ui.projectCheck, violationsConvertedToLogs);

			warningsCount = lintViolations.filter((v) => v.level === "warning").length;
			const errorsCount = lintViolations.filter((v) => v.level === "error").length;

			if (errorsCount > 0) {
				return {
					data: null,
					error: undefined,
					metadata: {
						code: ErrorCodes.lintFailed,
						payload: { warnings: warningsCount, errors: errorsCount },
					},
				};
			}
		}

		return { data: { warnings: warningsCount }, error: undefined, metadata: undefined };
	}

	static async build(projectId: string, resources: Record<string, Uint8Array>): Promise<ServiceResponse<string>> {
		const lintPhaseResponse = await ProjectsService._setResourcesAndLint(projectId, resources);

		if (lintPhaseResponse.error || lintPhaseResponse.metadata?.code === ErrorCodes.lintFailed) {
			return { data: undefined, error: undefined, metadata: lintPhaseResponse.metadata };
		}

		const lintWarningsCount = lintPhaseResponse.data?.warnings || 0;

		try {
			const { buildId, error: buildClientError } = await projectsClient.build({ projectId });

			if (buildClientError) {
				const message = convertErrorProtoToModel(buildClientError.value, projectId).message;
				LoggerService.error(`${namespaces.projectService} - Build: `, message);
				return {
					data: undefined,
					error: message,
					metadata: {
						code: ErrorCodes.buildFailed,
						payload: { warnings: lintWarningsCount },
					},
				};
			}

			return {
				data: buildId,
				error: undefined,
				metadata: { code: ErrorCodes.buildSucceed, payload: { warnings: lintWarningsCount } },
			};
		} catch (error) {
			LoggerService.error(
				namespaces.projectService,
				t("buildProjectError", { error: (error as Error).message, ns: "services", projectId })
			);
			return { data: undefined, error };
		}
	}

	static async lint(
		projectId: string,
		resources: Record<string, Uint8Array>
	): Promise<ServiceResponse<LintViolationCheck[]>> {
		try {
			const { violations } = await projectsClient.lint({
				projectId,
				resources,
				manifestFile: defaultManifestFileName,
			});
			const lintViolations = violations.map(convertViolationProtoToModel);

			return { data: lintViolations, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.projectService,
				t("lintProjectError", { error: (error as Error).message, ns: "services", projectId })
			);

			return { data: undefined, error };
		}
	}

	static async create(project: Project): Promise<ServiceResponse<string>> {
		try {
			const { projectId } = await projectsClient.create({
				project: { name: project.name, orgId: project.organizationId },
			});
			if (!projectId) {
				LoggerService.error(namespaces.projectService, t("projectNotCreated", { ns: "services" }));

				return { data: undefined, error: new Error(t("projectNotCreated", { ns: "services" })) };
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
				t("projectRemoveFailedExtended", { ns: "services", projectId, error: (error as Error).message })
			);

			return { data: undefined, error };
		}
	}
	static async _deploy(projectId: string, buildId: string): Promise<ServiceResponse<string>> {
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
				LoggerService.error(namespaces.projectService, t("projectNotFound", { ns: "services" }));

				return { data: undefined, error: new Error(t("projectNotFound", { ns: "services" })) };
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

	static async list(organizationId?: string): Promise<ServiceResponse<Project[]>> {
		try {
			const projects = (await projectsClient.list({ orgId: organizationId })).projects.map(
				convertProjectProtoToModel
			);

			return { data: projects, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async run(projectId: string, resources: Record<string, Uint8Array>): Promise<ServiceResponse<string>> {
		const { data: buildId, error: buildError, metadata: buildMetadata } = await this.build(projectId, resources);

		if (
			buildError ||
			(buildMetadata &&
				(buildMetadata.code === ErrorCodes.lintFailed || buildMetadata.code === ErrorCodes.buildFailed))
		) {
			return { data: undefined, error: buildError, metadata: buildMetadata };
		}

		const { data: deploymentId, error } = await this._deploy(projectId, buildId!);
		if (error) {
			LoggerService.error(`${namespaces.projectService} - Deploy`, (error as Error).message);

			return {
				data: undefined,
				error,
			};
		}

		const { error: activateError } = await DeploymentsService.activate(deploymentId!);
		const buildLintWarnings = buildMetadata?.payload.warnings || 0;
		if (activateError) {
			LoggerService.error(`${namespaces.projectService} - Activate`, (activateError as Error).message);
			return {
				data: undefined,
				error: activateError,
				metadata: { code: ErrorCodes.deployFailed, payload: { warnings: buildLintWarnings } },
			};
		}

		return {
			data: deploymentId,
			error: undefined,
			metadata: { code: ErrorCodes.deploySucceed, payload: { warnings: buildLintWarnings } },
		};
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
			});

			if (!project) {
				LoggerService.error(namespaces.projectService, t("projectNotFound", { ns: "services" }));

				return { data: undefined, error: new Error(t("projectNotFound", { ns: "services" })) };
			}

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async applyManifest(manifestYaml: string, organizationId?: string): Promise<ServiceResponse<string>> {
		try {
			const { projectIds } = await manifestApplyClient.apply({
				manifest: manifestYaml,
				path: "path",
				orgId: organizationId,
			});
			if (!projectIds || !projectIds.length) {
				return { data: undefined, error: new Error(t("projectNameExist", { ns: "services" })) };
			}

			return { data: projectIds[0], error: undefined };
		} catch (error: unknown) {
			LoggerService.error(
				namespaces.projectService,
				`${t("projectCreationFailedExtended", { error, ns: "services" })}`
			);

			return { data: undefined, error };
		}
	}

	static async export(projectId: string): Promise<ServiceResponse<Uint8Array>> {
		try {
			const { zipArchive: akProjectArchiveZip } = await projectsClient.export({ projectId });

			if (!akProjectArchiveZip) {
				LoggerService.error(namespaces.projectService, t("fetchExportFailed", { ns: "errors" }));

				return { data: undefined, error: new Error(t("fetchExportFailed", { ns: "errors" })) };
			}

			return { data: akProjectArchiveZip, error: undefined };
		} catch (error) {
			const errorMessage = t("fetchExportFailedUnexpectedError", {
				ns: "errors",
				error: (error as Error).message,
			});
			LoggerService.error(namespaces.projectService, errorMessage);

			return { data: undefined, error: errorMessage };
		}
	}
}

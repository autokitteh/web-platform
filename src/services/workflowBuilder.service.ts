import { t } from "i18next";

import { namespaces } from "@constants";
import { ConnectionService, LoggerService, TriggersService, VariablesService, BuildsService } from "@services";
import { ServiceResponse } from "@type";
import { Trigger, Connection, Variable } from "@type/models";

export interface ExistingCodeFile {
	path: string;
	name: string;
	content?: string;
	language: "python" | "starlark";
	exports?: string[];
}

export interface ProjectWorkflowData {
	triggers: Trigger[];
	files: ExistingCodeFile[];
	connections: Connection[];
	variables: Variable[];
}

export interface LoadProjectWorkflowDataOptions {
	includeTriggers?: boolean;
	includeConnections?: boolean;
	includeVariables?: boolean;
	includeFiles?: boolean;
}

const defaultLoadOptions: LoadProjectWorkflowDataOptions = {
	includeTriggers: true,
	includeConnections: true,
	includeVariables: true,
	includeFiles: true,
};

export class WorkflowBuilderService {
	static async loadProjectWorkflowData(
		projectId: string,
		buildId?: string,
		options: LoadProjectWorkflowDataOptions = defaultLoadOptions
	): Promise<ServiceResponse<ProjectWorkflowData>> {
		try {
			const promises: Promise<unknown>[] = [];
			const promiseKeys: (keyof ProjectWorkflowData)[] = [];

			if (options.includeTriggers) {
				promises.push(TriggersService.list(projectId));
				promiseKeys.push("triggers");
			}

			if (options.includeConnections) {
				promises.push(ConnectionService.list(projectId));
				promiseKeys.push("connections");
			}

			if (options.includeVariables) {
				promises.push(VariablesService.list(projectId));
				promiseKeys.push("variables");
			}

			if (options.includeFiles && buildId) {
				promises.push(WorkflowBuilderService.loadBuildFiles(buildId));
				promiseKeys.push("files");
			}

			const results = await Promise.allSettled(promises);

			const data: ProjectWorkflowData = {
				triggers: [],
				files: [],
				connections: [],
				variables: [],
			};

			const errors: string[] = [];

			results.forEach((result, index) => {
				const key = promiseKeys[index];

				if (result.status === "fulfilled") {
					const response = result.value as { data?: unknown; error?: unknown };
					if (response.data) {
						(data[key] as unknown) = response.data;
					} else if (response.error) {
						errors.push(`Failed to load ${key}: ${response.error}`);
					}
				} else {
					errors.push(`Failed to load ${key}: ${result.reason}`);
				}
			});

			if (errors.length > 0 && Object.values(data).every((array) => array.length === 0)) {
				const errorMessage = t("workflowDataLoadFailed", {
					ns: "services",
					errors: errors.join("; "),
				});
				LoggerService.error(namespaces.workflowBuilderService, errorMessage);

				return { data: undefined, error: new Error(errorMessage) };
			}

			if (errors.length > 0) {
				LoggerService.warn(namespaces.workflowBuilderService, `Partial load: ${errors.join("; ")}`);
			}

			return { data, error: undefined };
		} catch (error) {
			const errorMessage = t("workflowDataLoadError", {
				ns: "services",
				error: (error as Error).message,
				projectId,
			});
			LoggerService.error(namespaces.workflowBuilderService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async loadBuildFiles(buildId: string): Promise<{ data?: ExistingCodeFile[]; error?: unknown }> {
		try {
			const { data: buildDescription, error } = await BuildsService.getBuildDescription(buildId);

			if (error || !buildDescription) {
				return { data: undefined, error };
			}

			const buildInfo = JSON.parse(buildDescription);
			const files = WorkflowBuilderService.extractFilesFromBuildInfo(buildInfo);

			return { data: files, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.workflowBuilderService,
				t("buildFilesLoadFailed", { ns: "services", buildId, error: (error as Error).message })
			);

			return { data: undefined, error };
		}
	}

	static extractFilesFromBuildInfo(buildInfo: { runtimes?: Record<string, unknown> }): ExistingCodeFile[] {
		const files: ExistingCodeFile[] = [];

		if (!buildInfo.runtimes) {
			return files;
		}

		Object.entries(buildInfo.runtimes).forEach(([, runtime]) => {
			const runtimeData = runtime as {
				artifact?: {
					compiled_data?: Record<
						string,
						{
							exports?: string[];
							path?: string;
						}
					>;
				};
			};

			if (runtimeData.artifact?.compiled_data) {
				Object.entries(runtimeData.artifact.compiled_data).forEach(([filePath, fileData]) => {
					const fileName = filePath.split("/").pop() || filePath;
					const extension = fileName.split(".").pop()?.toLowerCase();
					const language: "python" | "starlark" = extension === "star" ? "starlark" : "python";

					files.push({
						path: fileData.path || filePath,
						name: fileName,
						language,
						exports: fileData.exports || [],
					});
				});
			}
		});

		return files;
	}

	static async loadTriggersOnly(projectId: string): Promise<ServiceResponse<Trigger[]>> {
		return TriggersService.list(projectId);
	}

	static async loadConnectionsOnly(projectId: string): Promise<ServiceResponse<Connection[]>> {
		return ConnectionService.list(projectId);
	}

	static async loadVariablesOnly(projectId: string): Promise<ServiceResponse<Variable[]>> {
		return VariablesService.list(projectId);
	}

	static async refreshProjectData(
		projectId: string,
		buildId?: string,
		dataTypes: (keyof ProjectWorkflowData)[] = ["triggers", "connections", "variables", "files"]
	): Promise<ServiceResponse<Partial<ProjectWorkflowData>>> {
		const options: LoadProjectWorkflowDataOptions = {
			includeTriggers: dataTypes.includes("triggers"),
			includeConnections: dataTypes.includes("connections"),
			includeVariables: dataTypes.includes("variables"),
			includeFiles: dataTypes.includes("files"),
		};

		const result = await WorkflowBuilderService.loadProjectWorkflowData(projectId, buildId, options);

		if (result.data) {
			const filteredData: Partial<ProjectWorkflowData> = {};
			dataTypes.forEach((key) => {
				if (result.data && result.data[key]) {
					(filteredData[key] as unknown) = result.data[key];
				}
			});

			return { data: filteredData, error: undefined };
		}

		return { data: undefined, error: result.error };
	}
}

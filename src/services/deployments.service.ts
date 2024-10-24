import i18n from "i18next";
import { get } from "lodash";

import { ActivateResponse, ListResponse } from "@ak-proto-ts/deployments/v1/svc_pb";
import { deploymentsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { SortOrder } from "@enums";
import { convertDeploymentProtoToModel } from "@models";
import { EnvironmentsService, LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Deployment } from "@type/models";
import { flattenArray, getIds, sortArray } from "@utilities";

export class DeploymentsService {
	static async activate(deploymentId: string): Promise<ServiceResponse<ActivateResponse>> {
		try {
			const activateResponse = await deploymentsClient.activate({ deploymentId });

			return { data: activateResponse, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("deployments.activateFailed", {
				deploymentId,
				error,
				ns: "services",
			});
			LoggerService.error(namespaces.deploymentsService, errorMessage);

			return { data: undefined, error: errorMessage };
		}
	}

	static async create(deployment: { buildId: string; envId: string }): Promise<ServiceResponse<string>> {
		try {
			const createResponse = await deploymentsClient.create({ deployment });

			return { data: createResponse.deploymentId, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("deployments.createFailed", {
				buildId: deployment.buildId,
				envId: deployment.envId,
				error,
				ns: "services",
			});
			LoggerService.error(namespaces.deploymentsService, errorMessage);

			return { data: undefined, error: errorMessage };
		}
	}

	static async deactivate(deploymentId: string): Promise<ServiceResponse<ActivateResponse>> {
		try {
			const deactivateResponse = await deploymentsClient.deactivate({ deploymentId });

			return { data: deactivateResponse, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("deployments.deactivateFailed", {
				deploymentId,
				error,
				ns: "services",
			});
			LoggerService.error(namespaces.deploymentsService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async delete(deploymentId: string): Promise<ServiceResponse<undefined>> {
		try {
			await deploymentsClient.delete({ deploymentId });

			return { data: undefined, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("deleteFailedIdError", {
				deploymentId,
				error: (error as Error).message,
				ns: "services",
			});
			LoggerService.error(namespaces.deploymentsService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async getById(deploymentId: string): Promise<ServiceResponse<Deployment>> {
		try {
			const { deployment } = await deploymentsClient.get({ deploymentId });
			if (!deployment) {
				return { data: undefined, error: new Error(i18n.t("deploymentFetchError", { ns: "services" })) };
			}

			return { data: convertDeploymentProtoToModel(deployment), error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("deploymentFetchErrorExtended", {
				deploymentId,
				error: (error as Error).message,
				ns: "services",
			});
			LoggerService.error(namespaces.deploymentsService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async listByEnvironmentIds(environmentsIds: string[]): Promise<ServiceResponse<Deployment[]>> {
		try {
			const deploymentsPromises = environmentsIds.map(
				async (envId) =>
					await deploymentsClient.list({
						envId,
						includeSessionStats: true,
					})
			);

			const deploymentsResponses = await Promise.allSettled(deploymentsPromises);
			const deploymentsSettled = flattenArray<Deployment>(
				deploymentsResponses
					.filter(
						(response): response is PromiseFulfilledResult<ListResponse> => response.status === "fulfilled"
					)
					.map((response) => get(response, "value.deployments", []).map(convertDeploymentProtoToModel))
			);

			const unsettledResponses = deploymentsResponses
				.filter((response): response is PromiseRejectedResult => response.status === "rejected")
				.map((response) => response.reason);

			if (unsettledResponses.length) {
				for (const error of unsettledResponses) {
					LoggerService.error(
						namespaces.deploymentsService,
						i18n.t("deploymentFetchByEnvironmentIdErrorExtended", {
							error: (error as Error).message,
							ns: "services",
						})
					);
				}
			}

			return {
				data: deploymentsSettled,
				error: unsettledResponses.length ? unsettledResponses : undefined,
			};
		} catch (error) {
			const errorMessage = i18n.t("deploymentFetchByEnvironmentIdErrorExtended", {
				error: (error as Error).message,
				ns: "services",
			});
			LoggerService.error(namespaces.deploymentsService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async listByProjectId(projectId: string): Promise<ServiceResponse<Deployment[]>> {
		try {
			const { data: environments, error: lisEnvironmentsError } =
				await EnvironmentsService.listByProjectId(projectId);

			if (lisEnvironmentsError) {
				return { data: undefined, error: lisEnvironmentsError };
			}

			const environmentIds = getIds(environments!, "envId");
			const { data: projectDeployments, error: listDeploymentsError } =
				await this.listByEnvironmentIds(environmentIds);

			if (listDeploymentsError) {
				return { data: undefined, error: listDeploymentsError };
			}
			sortArray(projectDeployments, "createdAt", SortOrder.DESC);

			return { data: projectDeployments!, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("listDeploymentsByProjectIdExtended", {
				projectId,
				error: (error as Error).message,
				ns: "services",
			});
			LoggerService.error(namespaces.deploymentsService, errorMessage);

			return { data: undefined, error: errorMessage };
		}
	}
}

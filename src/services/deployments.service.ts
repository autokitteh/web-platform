import { ActivateResponse, ListResponse } from "@ak-proto-ts/deployments/v1/svc_pb";
import { deploymentsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { SortOrder } from "@enums";
import { convertDeploymentProtoToModel } from "@models";
import { EnvironmentsService, LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Deployment } from "@type/models";
import { flattenArray, getIds, sortArray } from "@utilities";
import { get } from "lodash";

export class DeploymentsService {
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
					.filter((response): response is PromiseFulfilledResult<ListResponse> => response.status === "fulfilled")
					.map((response) => get(response, "value.deployments", []).map(convertDeploymentProtoToModel))
			);

			const unsettledResponses = deploymentsResponses
				.filter((response): response is PromiseRejectedResult => response.status === "rejected")
				.map((response) => response.reason);

			return {
				data: deploymentsSettled,
				error: unsettledResponses.length > 0 ? unsettledResponses : undefined,
			};
		} catch (error) {
			LoggerService.error(namespaces.deploymentsService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async listByProjectId(projectId: string): Promise<ServiceResponse<Deployment[]>> {
		const { data: environments, error: environmentsError } = await EnvironmentsService.listByProjectId(projectId);

		if (environmentsError) {
			LoggerService.error(namespaces.deploymentsService, (environmentsError as Error).message);

			return { data: undefined, error: environmentsError };
		}

		const environmentIds = getIds(environments!, "envId");
		const { data: projectDeployments, error: deploymentsError } = await this.listByEnvironmentIds(environmentIds);

		if (deploymentsError) {
			LoggerService.error(namespaces.deploymentsService, (deploymentsError as Error).message);

			return { data: undefined, error: deploymentsError };
		}
		sortArray(projectDeployments, "createdAt", SortOrder.DESC);

		return { data: projectDeployments!, error: undefined };
	}

	static async create(deployment: { envId: string; buildId: string }): Promise<ServiceResponse<string>> {
		try {
			const createResponse = await deploymentsClient.create({ deployment });

			return { data: createResponse.deploymentId, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.deploymentsService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async activate(deploymentId: string): Promise<ServiceResponse<ActivateResponse>> {
		try {
			const activateResponse = await deploymentsClient.activate({ deploymentId });
			return { data: activateResponse, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.deploymentsService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async deactivate(deploymentId: string): Promise<ServiceResponse<ActivateResponse>> {
		try {
			const deactivateResponse = await deploymentsClient.deactivate({ deploymentId });
			return { data: deactivateResponse, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.deploymentsService, (error as Error).message);
			return { data: undefined, error };
		}
	}
}

import { t } from "i18next";

import { ActivateResponse } from "@ak-proto-ts/deployments/v1/svc_pb";
import { deploymentsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { SortOrder } from "@enums";
import { convertDeploymentProtoToModel } from "@models";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Deployment } from "@type/models";
import { sortArray } from "@utilities";

export class DeploymentsService {
	static async activate(deploymentId: string): Promise<ServiceResponse<ActivateResponse>> {
		try {
			const activateResponse = await deploymentsClient.activate({ deploymentId });

			return { data: activateResponse, error: undefined };
		} catch (error) {
			const errorMessage = t("deployments.activateFailed", {
				deploymentId,
				error,
				ns: "services",
			});
			LoggerService.error(namespaces.deploymentsService, errorMessage);

			return { data: undefined, error: errorMessage };
		}
	}

	static async create(deployment: { buildId: string; projectId: string }): Promise<ServiceResponse<string>> {
		try {
			const createResponse = await deploymentsClient.create({ deployment });

			return { data: createResponse.deploymentId, error: undefined };
		} catch (error) {
			const errorMessage = t("deployments.createFailed", {
				buildId: deployment.buildId,
				error,
				ns: "services",
				projectId: deployment.projectId,
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
			const errorMessage = t("deployments.deactivateFailed", {
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
			const errorMessage = t("deleteFailedIdError", {
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
				return { data: undefined, error: new Error(t("deploymentFetchError", { ns: "services" })) };
			}

			return { data: convertDeploymentProtoToModel(deployment), error: undefined };
		} catch (error) {
			const errorMessage = t("deploymentFetchErrorExtended", {
				deploymentId,
				error: (error as Error).message,
				ns: "services",
			});
			LoggerService.error(namespaces.deploymentsService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async list(projectId: string): Promise<ServiceResponse<Deployment[]>> {
		try {
			const { deployments: projectDeployments } = await deploymentsClient.list({
				projectId,
				includeSessionStats: true,
			});

			sortArray(projectDeployments, "createdAt", SortOrder.DESC);
			const sortedAndConvertedDeployments = projectDeployments.map(convertDeploymentProtoToModel);

			return { data: sortedAndConvertedDeployments!, error: undefined };
		} catch (error) {
			const errorMessage = t("listDeploymentsByProjectIdExtended", {
				projectId,
				error: (error as Error).message,
				ns: "services",
			});
			LoggerService.error(namespaces.deploymentsService, errorMessage);

			return { data: undefined, error: errorMessage };
		}
	}
}

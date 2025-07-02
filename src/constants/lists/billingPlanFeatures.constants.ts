import { TFunction } from "i18next";

export interface BillingPlanFeature {
	name: string;
	free: string;
	pro: string;
	enterprise: string;
	isPrice?: boolean;
}

export const getBillingPlanFeatures = (t: TFunction): BillingPlanFeature[] => [
	{
		name: t("features.projects"),
		free: t("featureValues.freeProjects"),
		pro: t("featureValues.proProjects"),
		enterprise: t("featureValues.enterpriseProjects"),
	},
	{
		name: t("features.automations"),
		free: t("featureValues.freeAutomations"),
		pro: t("featureValues.proAutomations"),
		enterprise: t("featureValues.enterpriseAutomations"),
	},
	{
		name: t("features.concurrentAutomations"),
		free: t("featureValues.freeConcurrentAutomations"),
		pro: t("featureValues.proConcurrentAutomations"),
		enterprise: t("featureValues.enterpriseConcurrentAutomations"),
	},
	{
		name: t("features.dataRetention"),
		free: t("featureValues.freeDataRetention"),
		pro: t("featureValues.proDataRetention"),
		enterprise: t("featureValues.enterpriseDataRetention"),
	},
	{
		name: t("features.schedules"),
		free: t("featureValues.freeSchedules"),
		pro: t("featureValues.proSchedules"),
		enterprise: t("featureValues.enterpriseSchedules"),
	},
	{
		name: t("features.incomingEvents"),
		free: t("featureValues.freeIncomingEvents"),
		pro: t("featureValues.proIncomingEvents"),
		enterprise: t("featureValues.enterpriseIncomingEvents"),
	},
	{
		name: t("features.appIntegrations"),
		free: t("featureValues.freeAppIntegrations"),
		pro: t("featureValues.proAppIntegrations"),
		enterprise: t("featureValues.enterpriseAppIntegrations"),
	},
	{
		name: t("features.computeTime"),
		free: t("featureValues.freeComputeTime"),
		pro: t("featureValues.proComputeTime"),
		enterprise: t("featureValues.enterpriseComputeTime"),
	},
];

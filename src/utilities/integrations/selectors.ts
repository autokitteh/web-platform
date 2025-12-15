import { t } from "i18next";

import { ConnectionAuthType } from "@enums/connections";
import { SelectOption } from "@interfaces/components";
import { integrationConfig } from "@src/constants/connections/integrations.config";
import { featureFlags } from "@src/constants/featureFlags.constants";
import { Integrations } from "@src/enums/components";
import { IntegrationSelectOption } from "@src/interfaces/components/forms";
import { IntegrationConfig, IntegrationZodSchema } from "@src/types/integrations";

export const getIntegrationConfig = (integration: Integrations): IntegrationConfig => {
	return integrationConfig[integration];
};

export const getAuthMethodsForIntegration = (integration: Integrations): SelectOption[] => {
	const config = integrationConfig[integration];
	if (!config) return [];

	return Object.entries(config.authMethods)
		.filter(([, authMethod]) => {
			if (authMethod?.hidden) return false;

			if (authMethod?.featureFlag) {
				const flagKey = authMethod.featureFlag as keyof typeof featureFlags;
				if (featureFlags[flagKey]) return false;
			}
			return true;
		})
		.map(([authType, authMethod]) => ({
			label: authMethod!.label,
			value: authType as ConnectionAuthType,
		}));
};

export const getAuthMethodConfig = (integration: Integrations, authType: ConnectionAuthType) => {
	const config = integrationConfig[integration];
	if (!config) return null;

	return config.authMethods[authType] || null;
};

export const getSchemaForAuthMethod = (
	integration: Integrations,
	authType: ConnectionAuthType
): IntegrationZodSchema | null => {
	const authMethod = getAuthMethodConfig(integration, authType);
	return authMethod?.schema || null;
};

export const getFormForAuthMethod = (integration: Integrations, authType: ConnectionAuthType) => {
	const authMethod = getAuthMethodConfig(integration, authType);
	return authMethod?.form || null;
};

export const getVariablesMappingForAuthMethod = (
	integration: Integrations,
	authType: ConnectionAuthType
): Record<string, string> => {
	const authMethod = getAuthMethodConfig(integration, authType);
	return authMethod?.variablesMapping || {};
};

export const getDataKeysForAuthMethod = (integration: Integrations, authType: ConnectionAuthType): string[] => {
	const authMethod = getAuthMethodConfig(integration, authType);
	return authMethod?.dataKeys || [];
};

export const getDefaultAuthMethod = (integration: Integrations): ConnectionAuthType => {
	const config = integrationConfig[integration];
	return config?.defaultAuthMethod || ConnectionAuthType.Oauth;
};

export const getIntegrationIcon = (
	integration: Integrations
): React.ComponentType<React.SVGProps<SVGSVGElement>> | null => {
	const config = integrationConfig[integration];
	return config?.icon || null;
};

export const getIntegrationInfoLinks = (integration: Integrations): { text: string; url: string }[] => {
	const config = integrationConfig[integration];
	if (!config?.infoLinks) return [];

	return config.infoLinks.map((link) => ({
		text: t(link.translationKey, { ns: "integrations" }),
		url: link.url,
	}));
};

export const getAuthMethodInfoLinks = (
	integration: Integrations,
	authMethod: ConnectionAuthType
): { text: string; url: string }[] => {
	const config = integrationConfig[integration];
	const authMethodConfig = config?.authMethods?.[authMethod];

	if (authMethodConfig?.infoLinks) {
		return authMethodConfig.infoLinks.map((link) => ({
			text: t(link.translationKey, { ns: "integrations" }),
			url: link.url,
		}));
	}

	return getIntegrationInfoLinks(integration);
};

export const getCustomAddForm = (integration: Integrations) => {
	const config = integrationConfig[integration];
	return config?.customAddForm || null;
};

export const getCustomEditForm = (integration: Integrations) => {
	const config = integrationConfig[integration];
	return config?.customEditForm || null;
};

export const isIntegrationHidden = (integration: Integrations): boolean => {
	const config = integrationConfig[integration];
	if (!config) return false;

	if (config.visibility.hidden) return true;

	if (config.visibility.featureFlag) {
		const flagKey = config.visibility.featureFlag as keyof typeof featureFlags;
		return featureFlags[flagKey] === true;
	}

	return false;
};

export const isLegacyIntegration = (integration: Integrations): boolean => {
	const config = integrationConfig[integration];
	return config?.visibility.isLegacy || false;
};

export const hasLegacyConnectionType = (integration: Integrations): boolean => {
	const config = integrationConfig[integration];
	return config?.visibility.hasLegacyConnectionType || false;
};

export const getVisibleIntegrations = (): Integrations[] => {
	return Object.values(Integrations).filter((integration) => !isIntegrationHidden(integration));
};

export const getIntegrationsByCategory = (category: IntegrationConfig["category"]): Integrations[] => {
	return Object.entries(integrationConfig)
		.filter(([, config]) => config.category === category && !isIntegrationHidden(config.id))
		.map(([integration]) => integration as Integrations);
};

export const getLegacyAuthTypeMapping = (
	integration: Integrations,
	authType: ConnectionAuthType
): ConnectionAuthType | null => {
	const authMethod = getAuthMethodConfig(integration, authType);
	return authMethod?.legacyAuthType || null;
};

export const getAuthMethodsForLegacyConnection = (integration: Integrations): SelectOption[] => {
	const config = integrationConfig[integration];
	if (!config || !config.visibility.hasLegacyConnectionType) {
		return getAuthMethodsForIntegration(integration);
	}

	return Object.entries(config.authMethods)
		.filter(([, authMethod]) => {
			if (authMethod?.hidden) return false;
			if (authMethod?.featureFlag) {
				const flagKey = authMethod.featureFlag as keyof typeof featureFlags;
				if (featureFlags[flagKey]) return false;
			}
			return true;
		})
		.map(([authType, authMethod]) => {
			if (authMethod?.legacyAuthType) {
				return {
					label: authMethod.label,
					value: authMethod.legacyAuthType,
				};
			}
			return {
				label: authMethod!.label,
				value: authType as ConnectionAuthType,
			};
		});
};

export const getDefaultAuthTypeWithFeatureFlags = (
	integration: Integrations,
	authOptions: SelectOption[]
): ConnectionAuthType => {
	const config = integrationConfig[integration];

	if (!config) {
		return authOptions.length > 0 ? (authOptions[0].value as ConnectionAuthType) : ConnectionAuthType.Oauth;
	}

	const defaultAuth = config.defaultAuthMethod;
	const isDefaultAvailable = authOptions.some((opt) => opt.value === defaultAuth);

	if (isDefaultAvailable) {
		return defaultAuth;
	}

	return authOptions.length > 0 ? (authOptions[0].value as ConnectionAuthType) : ConnectionAuthType.Oauth;
};

export const getIntegrationTypes = (): SelectOption[] => {
	const visibleIntegrations = Object.values(integrationConfig).filter((config) => {
		if (config.visibility.hidden) return false;

		if (config.visibility.featureFlag) {
			const flagKey = config.visibility.featureFlag as keyof typeof featureFlags;
			if (featureFlags[flagKey] === true) return false;
		}

		return true;
	});

	const sortedIntegrations = visibleIntegrations.sort((a, b) => a.label.localeCompare(b.label));

	return sortedIntegrations.map((config) => ({
		label: config.label,
		value: config.id,
		icon: config.icon,
	}));
};

export const getIntegrationTypesMap = (): Record<Integrations, IntegrationSelectOption> => {
	const visibleIntegrations = Object.values(integrationConfig).filter((config) => {
		if (config.visibility.hidden) return false;

		if (config.visibility.featureFlag) {
			const flagKey = config.visibility.featureFlag as keyof typeof featureFlags;
			if (featureFlags[flagKey] === true) return false;
		}

		return true;
	});

	const result: Partial<Record<Integrations, IntegrationSelectOption>> = {};

	visibleIntegrations.forEach((config) => {
		result[config.id] = {
			label: config.label,
			value: config.id,
			icon: config.icon,
		};
	});

	return result as Record<Integrations, IntegrationSelectOption>;
};

export const getIntegrationIconsMap = (): Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> => {
	return Object.fromEntries(
		Object.values(integrationConfig)
			.filter((config) => config.icon !== undefined)
			.map((config) => [config.id, config.icon!])
	);
};

export const getFormOptionsForIntegration = (
	integration: Integrations,
	fieldName: string
): { disabled?: boolean; label: string; value: string }[] => {
	const config = getIntegrationConfig(integration);
	return config?.formOptions?.[fieldName] || [];
};

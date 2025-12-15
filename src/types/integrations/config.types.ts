import { FieldErrors, UseFormRegister } from "react-hook-form";
import { ZodEffects, ZodObject, ZodRawShape, ZodTypeAny } from "zod";

import { ConnectionAuthType } from "@enums/connections";
import { featureFlags } from "@src/constants";
import { Integrations } from "@src/enums/components";

export type IntegrationZodSchema =
	| ZodObject<{ auth_type?: ZodTypeAny } & ZodRawShape>
	| ZodEffects<ZodObject<{ auth_type?: ZodTypeAny } & ZodRawShape>>;

export type IntegrationCategory = "code" | "communication" | "productivity" | "cloud" | "crm" | "ai" | "other";

export type FeatureFlagKey = keyof typeof featureFlags;

export type AuthFormProps = {
	clearErrors?: any;
	control: any;
	copyToClipboard?: (text: string) => void;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode?: "create" | "edit";
	register?: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
};

export type AuthMethodConfig = {
	dataKeys: string[];
	featureFlag?: FeatureFlagKey;
	form: React.ComponentType<any>;
	hidden?: boolean;
	infoLinks?: InfoLink[];
	label: string;
	legacyAuthType?: ConnectionAuthType;
	schema: IntegrationZodSchema;
	variablesMapping: Record<string, string>;
};

export type IntegrationVisibility = {
	featureFlag: FeatureFlagKey | null;
	hasLegacyConnectionType: boolean;
	hidden: boolean;
	isLegacy: boolean;
};

export type InfoLink = {
	translationKey: string;
	url: string;
};

export type FormFieldOption = {
	disabled?: boolean;
	label: string;
	value: string;
};

export type IntegrationFormOptions = Record<string, FormFieldOption[]>;

export type IntegrationConfig<TAuthMethods extends ConnectionAuthType = ConnectionAuthType> = {
	authMethods: Partial<Record<TAuthMethods, AuthMethodConfig>>;
	category: IntegrationCategory;
	customAddForm?: React.ComponentType<any>;
	customEditForm?: React.ComponentType<any>;
	defaultAuthMethod: TAuthMethods;
	formOptions?: IntegrationFormOptions;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	id: Integrations;
	infoLinks: InfoLink[];
	label: string;
	visibility: IntegrationVisibility;
};

export type IntegrationConfigMap = {
	[K in Integrations]: IntegrationConfig;
};

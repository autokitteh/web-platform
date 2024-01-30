import { english } from "@i18n/en";

type NestedKeyOf<ObjectType extends object> = {
	[Key in keyof ObjectType & string]: ObjectType[Key] extends object ? `${Key}.${NestedKeyOf<ObjectType[Key]>}` : Key;
}[keyof ObjectType & string];

interface CustomTypeOptions {
	defaultNS: "translation";
	resources: {
		translation: NestedKeyOf<typeof english>;
	};
}

declare module "i18next" {
	CustomTypeOptions;
}

export type TranslationKeys = CustomTypeOptions["resources"]["translation"];

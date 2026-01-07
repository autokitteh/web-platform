import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import liferay from "@liferay/eslint-plugin";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import localRules from "eslint-plugin-local-rules";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier";
import promise from "eslint-plugin-promise";
import reactRefresh from "eslint-plugin-react-refresh";
import tailwind from "eslint-plugin-tailwindcss";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const compat = new FlatCompat({
	baseDirectory: dirName,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	...tailwind.configs["flat/recommended"],
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	{
		ignores: [
			"**/dist",
			"**/.eslintrc.cjs",
			"!**/.storybook",
			"**/node_modules/",
			"**/dist/",
			"**/env.d.ts",
			"src/autokitteh",
			"**/playwright-report/",
			"**/test-results/",
			"**/tsconfig.json",
			"**/tsconfig.node.json",
			"**/CHANGELOG.md",
			"**/.claude/**",
			".github/workflows/*",
			"**/env.d.ts",
			"**/package.json",
			"**/package-lock.json",
			"scripts/**/*.mjs",
			"scripts/**/*.js",
		],
	},
	...fixupConfigRules(
		compat.extends(
			"eslint:recommended",
			"plugin:react/recommended",
			"plugin:react-hooks/recommended",
			"plugin:jsx-a11y/recommended",
			"plugin:@typescript-eslint/recommended",
			"plugin:storybook/recommended",
			"plugin:security/recommended-legacy",
			"plugin:promise/recommended",
			"plugin:prettier/recommended"
		)
	),
	{
		plugins: {
			"react-refresh": reactRefresh,
			unicorn,
			"@typescript-eslint": fixupPluginRules(typescriptEslint),
			promise: fixupPluginRules(promise),
			"@liferay": fixupPluginRules(liferay),
			"local-rules": localRules,
			perfectionist,
			prettier: fixupPluginRules(prettier),
		},

		languageOptions: {
			globals: {
				...globals.browser,
			},

			parser: tsParser,
		},
		settings: {
			tailwindcss: {
				config: path.join(dirName, "tailwind.config.cjs"),
				callees: ["cn"],
			},
			react: {
				version: "detect",
			},

			"import/parsers": {
				"@typescript-eslint/parser": [".ts", ".tsx"],
			},

			"import/resolver": {
				alias: {
					map: [["tailwind-config", "./tailwind.config.cjs"]],
				},
				typescript: {
					alwaysTryTypes: true,
					project: ["./tsconfig.json"],
				},
				node: true,
			},
		},

		rules: {
			"local-rules/no-extra-classname-spaces": "error",
			"import/namespace": "off",
			"tailwindcss/no-custom-classname": [
				"error",
				{
					callees: ["cn"],
					cssFiles: ["src/assets/index.css", "src/assets/loader.css"],
					whitelist: ["(.*)current", "nodrag", "nopan", "react-flow__edge-interaction"],
				},
			],
			"@typescript-eslint/no-unused-expressions": "off",
			"sort-keys": "off",

			"perfectionist/sort-object-types": [
				"error",
				{
					type: "alphabetical",
					order: "asc",
				},
			],
			"@typescript-eslint/adjacent-overload-signatures": "off",
			"perfectionist/sort-imports": "off",
			"local-rules/no-abbreviations": "error",
			"@liferay/no-anonymous-exports": "off",
			"@liferay/sort-class-names": "off",
			"@liferay/empty-line-between-elements": "off",

			"@typescript-eslint/member-ordering": [
				"error",
				{
					default: ["signature", "field", "constructor", "method"],
				},
			],

			"@typescript-eslint/no-explicit-any": "off",

			"prettier/prettier": [
				"error",
				{
					arrowParens: "always",
					bracketSpacing: true,
					jsxSingleQuote: false,
					printWidth: 120,
					quoteProps: "as-needed",
					semi: true,
					singleQuote: false,
					tabWidth: 4,
					trailingComma: "es5",
					useTabs: true,
					endOfLine: "auto",
				},
			],

			"security/detect-object-injection": "off",

			"react-refresh/only-export-components": [
				"warn",
				{
					allowConstantExport: true,
				},
			],

			"react/prefer-stateless-function": "error",
			"react/no-unused-prop-types": "error",
			"react/jsx-pascal-case": "error",
			"react/jsx-no-script-url": "error",
			"react/no-children-prop": "error",
			"react/no-danger": "error",
			"react/no-danger-with-children": "error",

			"react/no-unstable-nested-components": [
				"error",
				{
					allowAsProps: true,
				},
			],

			"react/jsx-fragments": "error",

			"react/destructuring-assignment": [
				"error",
				"always",
				{
					destructureInSignature: "always",
				},
			],

			"react/jsx-no-leaked-render": [
				"error",
				{
					validStrategies: ["ternary"],
				},
			],

			"react/jsx-max-depth": [
				"error",
				{
					max: 8,
				},
			],

			"react/function-component-definition": [
				"error",
				{
					namedComponents: "arrow-function",
				},
			],

			"react/jsx-key": [
				"error",
				{
					checkFragmentShorthand: true,
					checkKeyMustBeforeSpread: true,
					warnOnDuplicates: true,
				},
			],

			"react/jsx-no-useless-fragment": "warn",
			"react/jsx-curly-brace-presence": "warn",
			"react/no-typos": "warn",
			"react/display-name": "warn",
			"react/self-closing-comp": "warn",
			"react/jsx-sort-props": "warn",
			"react/react-in-jsx-scope": "off",
			"react/jsx-one-expression-per-line": "off",
			"react/prop-types": "off",

			"@typescript-eslint/naming-convention": [
				"warn",
				{
					selector: "default",
					format: ["strictCamelCase", "PascalCase", "StrictPascalCase"],
					leadingUnderscore: "allow",
				},
				{
					selector: "variable",
					format: ["PascalCase", "camelCase"],
					leadingUnderscore: "allow",
				},
				{
					selector: "parameter",
					format: ["strictCamelCase", "PascalCase", "StrictPascalCase"],
					leadingUnderscore: "allow",
				},
				{
					selector: "property",
					format: null,
					leadingUnderscore: "allow",
				},
				{
					selector: "typeLike",
					format: ["PascalCase"],
				},
			],

			"no-throw-literal": "warn",
			"import/no-named-as-default": "off",
			"unicorn/filename-case": [
				"error",
				{
					case: "camelCase",
				},
			],

			"no-console": "error",
			"@liferay/sort-imports": "off",
			"@liferay/group-imports": "off",

			"import/order": [
				"error",
				{
					groups: [
						["builtin", "external"],
						["internal", "parent", "sibling", "index"],
					],

					pathGroups: [
						{
							pattern: "react",
							group: "external",
							position: "before",
						},
						{
							pattern: "@(enums|interfaces|types|utilities|constants|services|validations)/**",
							group: "internal",
							position: "after",
						},
						{
							pattern: "{@hooks,@store}",
							group: "internal",
							position: "after",
						},
						{
							pattern: "@components/**",
							group: "internal",
							position: "after",
						},
						{
							pattern: "@shared-components/**",
							group: "internal",
							position: "after",
						},
						{
							pattern: "@assets/**",
							group: "internal",
							position: "after",
						},
					],

					pathGroupsExcludedImportTypes: ["react"],
					"newlines-between": "always",

					alphabetize: {
						order: "asc",
						caseInsensitive: true,
					},
				},
			],

			"import/first": "error",
			"import/no-duplicates": "error",
			"import/newline-after-import": "error",
		},
	},
	{
		files: ["**/*.json"],

		rules: {
			"no-unused-expressions": "off",
			"unicorn/filename-case": "off",
		},
	},
	{
		files: ["**/*.stories.js", "**/*.stories.jsx", "**/*.stories.ts", "**/*.stories.tsx"],

		rules: {
			"sort-keys": "off",
		},
	},
];

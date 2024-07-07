const path = require("path");

module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
		"plugin:jsx-a11y/recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:storybook/recommended",
		"plugin:prettier/recommended",
		"plugin:security/recommended-legacy",
		"plugin:promise/recommended",
		"plugin:@liferay/react",
	],
	settings: {
		"react": {
			version: "detect",
		},
		"import/parsers": {
			"@typescript-eslint/parser": [".ts", ".tsx"],
		},
		"import/resolver": {
			alias: {
				map: [
					["@assets", "./src/assets"],
					["@components", "./src/components"],
					["@api", "./src/api"],
					["@routing", "./src/routing"],
					["@utils", "./src/utils"],
					["@validations", "./src/validations"],
				],
			},
			node: {
				paths: ["src"],
				extensions: [".js", ".jsx", ".ts", ".tsx"],
			},
			typescript: {
				alwaysTryTypes: true,
				project: ["./tsconfig.json"],
			},
		},
	},
	ignorePatterns: ["dist", ".eslintrc.cjs", "src/stories"],
	parser: "@typescript-eslint/parser",
	plugins: [
		"react-refresh",
		"unicorn",
		"import",
		"@typescript-eslint",
		"promise",
		"@liferay",
		"eslint-plugin-local-rules",
		"prettier",
		"import",
	],
	rules: {
		"local-rules/no-abbreviations": "error",
		"@liferay/no-anonymous-exports": "off",
		"sort-keys": "error",
		"@liferay/sort-class-names": "error",
		"@typescript-eslint/member-ordering": [
			"error",
			{
				default: ["signature", "field", "constructor", "method"],
			},
		],
		"@typescript-eslint/no-explicit-any": "off",
		"prettier/prettier": ["error", { endOfLine: "auto" }, { usePrettierrc: true }],
		"security/detect-object-injection": "off",
		"react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
		"react/prefer-stateless-function": "error",
		"react/no-unused-prop-types": "error",
		"react/jsx-pascal-case": "error",
		"react/jsx-no-script-url": "error",
		"react/no-children-prop": "error",
		"react/no-danger": "error",
		"react/no-danger-with-children": "error",
		"react/no-unstable-nested-components": ["error", { allowAsProps: true }],
		"react/jsx-fragments": "error",
		"react/destructuring-assignment": ["error", "always", { destructureInSignature: "always" }],
		"react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary"] }],
		"react/jsx-max-depth": ["error", { max: 6 }],
		"react/function-component-definition": ["error", { namedComponents: "arrow-function" }],
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
		"unicorn/filename-case": ["error", { case: "camelCase" }],
		"no-console": "error",
		"@liferay/sort-imports": "off",
		"@liferay/group-imports": "off",
		"import/order": [
			"error",
			{
				"groups": [
					["builtin", "external"],
					["internal", "parent", "sibling", "index"],
				],
				"pathGroups": [
					{
						pattern: "react",
						group: "external",
						position: "before",
					},
				],
				"pathGroupsExcludedImportTypes": ["react"],
				"newlines-between": "always",
				"alphabetize": {
					order: "asc",
					caseInsensitive: true,
				},
			},
		],
		"import/first": "error",
		"import/no-duplicates": "error",
		"import/newline-after-import": "error",
	},
	settings: {
		"import/resolver": {
			node: {
				extensions: [".js", ".jsx", ".ts", ".tsx"],
			},
		},
	},
};

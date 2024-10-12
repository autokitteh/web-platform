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
		"plugin:security/recommended-legacy",
		"plugin:promise/recommended",
		"plugin:@liferay/react",
		"plugin:prettier/recommended",
		"plugin:tailwindcss/recommended"
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
					["@", "./src"],
					["@ak-proto-ts", "./src/autokitteh/proto/gen/ts/autokitteh"],
					["@api", "./src/api"],
					["@assets", "./src/assets"],
					["@components", "./src/components"],
					["@constants", "./src/constants"],
					["@enums", "./src/enums"],
					["@hooks", "./src/hooks"],
					["@i18n", "./src/i18n"],
					["@interfaces", "./src/interfaces"],
					["@locales", "./src/locales"],
					["@models", "./src/models"],
					["@routing", "./src/routing"],
					["@services", "./src/services"],
					["@store", "./src/store"],
					["@type", "./src/types"],
					["@utilities", "./src/utilities"],
					["@utils", "./src/utils"],
					["@validations", "./src/validations"],
					["tailwind-config", "./tailwind.config.cjs"],
				],
				extensions: [".js", ".jsx", ".ts", ".tsx"],
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
	ignorePatterns: ["dist", ".eslintrc.cjs", "!.storybook"],
	parser: "@typescript-eslint/parser",
	plugins: [
		"react-refresh",
		"unicorn",
		"import",
		"@typescript-eslint",
		"promise",
		"@liferay",
		"eslint-plugin-local-rules",
		"import",
		"perfectionist",
		"prettier"
	],
	rules: {
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
				"arrowParens": "always",
				"bracketSpacing": true,
				"jsxSingleQuote": false,
				"printWidth": 120,
				"quoteProps": "consistent",
				"semi": true,
				"singleQuote": false,
				"tabWidth": 4,
				"trailingComma": "es5",
				"useTabs": true
			},
		],
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
		"react/jsx-max-depth": ["error", { max: 7 }],
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
						pattern: "@assets/**",
						group: "internal",
						position: "after",
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
	"overrides": [
		{
			"files": ["*.json"],
			"rules": {
				"no-unused-expressions": "off",
				"unicorn/filename-case": "off"
			}
		},
		{
			"files": ["*.stories.js", "*.stories.jsx", "*.stories.ts", "*.stories.tsx"],
			"rules": {
				"sort-keys": "off"
			}
		}
	]
};

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
		"prettier",
		"plugin:security/recommended-legacy",
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
				alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
				// use an array of glob patterns
				project: ["./tsconfig.json"],
			},
		},
	},
	ignorePatterns: ["dist", ".eslintrc.cjs", "src/stories"],
	parser: "@typescript-eslint/parser",
	plugins: ["react-refresh", "prettier", "unicorn", "import", "@typescript-eslint"],
	rules: {
		"@typescript-eslint/no-explicit-any": "off",
		"prettier/prettier": [
			"error",
			{
				endOfLine: "auto",
			},
			{ usePrettierrc: true },
		],
		"security/detect-object-injection": "off",
		// React Rules
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
		// TypeScript Rules
		"@typescript-eslint/naming-convention": [
			"warn",
			{
				selector: "default",
				format: ["strictCamelCase", "PascalCase", "StrictPascalCase"],
				leadingUnderscore: "allow",
			},
			{
				selector: "variable",
				// Specify PascalCase for React components
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
		"unicorn/filename-case": [
			"error",
			{
				case: "camelCase",
			},
		],
		"import/order": [
			"error",
			{
				"alphabetize": {
					caseInsensitive: true,
					order: "asc",
				},
				"groups": ["external", "builtin", "parent", ["sibling", "index"]],
				"newlines-between": "never",
				"pathGroups": [
					{
						group: "external",
						pattern: "react",
						position: "before",
					},
					{
						group: "builtin",
						pattern: "**",
						position: "after",
					},
					{
						group: "external",
						pattern: "./**",
						position: "after",
					},
				],
				"pathGroupsExcludedImportTypes": ["builtin"],
			},
		],
	},
};

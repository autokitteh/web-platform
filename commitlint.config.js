export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"],
		],
		"type-case": [2, "always", "lower-case"],
		"type-empty": [2, "never"],
		"scope-empty": [2, "never"],
		"scope-case": [2, "always", "upper-case"],
		"scope-max-length": [2, "always", 20],
		"scope-min-length": [2, "always", 3],
		"scope-format": [2, "always", /^[A-Z]+-\d+$/],
		"subject-case": [2, "always", "lower-case"],
		"subject-empty": [2, "never"],
		"subject-full-stop": [2, "never", "."],
		"header-max-length": [2, "always", 72],
		"body-leading-blank": [2, "always"],
		"body-max-line-length": [2, "always", 100],
		"footer-leading-blank": [2, "always"],
		"footer-max-line-length": [2, "always", 100],
	},
	plugins: [
		{
			rules: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				"scope-format": (parsed, when, value) => {
					const { scope } = parsed;
					if (!scope) return [true];
					const regex = new RegExp(value);
					const negated = when === "never";
					return [
						negated ? !regex.test(scope) : regex.test(scope),
						`scope must ${negated ? "not " : ""}match pattern ${value}`,
					];
				},
			},
		},
	],
};

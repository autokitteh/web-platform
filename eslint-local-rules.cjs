/* eslint-disable local-rules/no-abbreviations */
module.exports = {
	"no-abbreviations": {
		meta: {
			type: "suggestion",
			docs: {
				description: "disallow abbreviations",
				category: "Best Practices",
			},
			fixable: "code",
			messages: {
				noAbbrev: "Abbreviation '{{abbr}}' is not allowed. Use '{{fullWord}}' instead.",
			},
			schema: [],
		},

		create(context) {
			const abbreviations = {
				usr: "user",
				arr: "array",
				obj: "object",
				err: "error",
				idx: "index",
			};

			return {
				Identifier(node) {
					const name = node.name;
					Object.keys(abbreviations).forEach((abbr) => {
						if (name === abbr) {
							const fullWord = abbreviations[abbr];
							context.report({
								node,
								messageId: "noAbbrev",
								data: { abbr, fullWord },
								fix(fixer) {
									return fixer.replaceText(node, fullWord);
								},
							});
						}
					});
				},
			};
		},
	},
};

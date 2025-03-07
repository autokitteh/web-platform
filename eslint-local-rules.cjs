/* eslint-disable unicorn/filename-case */
/* eslint-disable local-rules/no-abbreviations */
// eslint-disable-next-line no-undef
module.exports = {
	"no-extra-classname-spaces":{
		meta: {
		  type: "suggestion",
		  docs: {
			description: "Remove extra spaces in className attributes",
			category: "Stylistic Issues",
		  },
		  fixable: "code",
		},
		create(context) {
		  return {
			JSXAttribute(node) {
			  if (
				node.name.name === "className" && 
				node.value && 
				node.value.type === "Literal"
			  ) {
				const value = node.value.value;
				if (typeof value === "string") {
				  const normalized = value.replace(/\s+/g, " ").trim();
				  if (value !== normalized) {
					context.report({
					  node,
					  message: "className has extra spaces",
					  fix(fixer) {
						return fixer.replaceText(
						  node.value,
						  `"${normalized}"`
						);
					  }
					});
				  }
				}
			  }
			}
		  };
		}
	  },
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

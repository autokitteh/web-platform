/* eslint-disable unicorn/filename-case */
export default {
	parserOpts: {
		headerPattern: /^(\w+)(?:\(([^)]+)\))?: (.+)$/,
		headerCorrespondence: ["type", "scope", "subject"],
		breakingHeaderPattern: /^(\w+)(?:\(([^)]+)\))?!: (.+)$/,
		breakingHeaderCorrespondence: ["type", "scope", "subject"],
		revertHeaderPattern: /^revert: (?:(\w+)(?:\(([^)]+)\))?: )?(.+)$/,
		revertHeaderCorrespondence: ["type", "scope", "subject"],
		issuePrefixes: ["#"],
		noteKeywords: ["BREAKING CHANGE", "BREAKING-CHANGE"],
		fieldPattern: /^-(.*?)-$/,
		revertPattern: /^(?:Revert|revert:)\s"([\s\S]+)"\s*This reverts commit (\w+)\./i,
		revertCorrespondence: ["header", "hash"],
	},
};

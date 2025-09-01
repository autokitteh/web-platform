import { languages } from "monaco-editor";

export const pythonTokenizerConfig: languages.IMonarchLanguage = {
	defaultToken: "",
	tokenPostfix: ".python",
	keywords: [
		// Python keywords only (not built-in functions)
		"and",
		"as",
		"assert",
		"async",
		"await",
		"break",
		"class",
		"continue",
		"def",
		"del",
		"elif",
		"else",
		"except",
		"finally",
		"for",
		"from",
		"global",
		"if",
		"import",
		"in",
		"is",
		"lambda",
		"nonlocal",
		"not",
		"or",
		"pass",
		"raise",
		"return",
		"try",
		"while",
		"with",
		"yield",
		// Python constants
		"True",
		"False",
		"None",
	],
	brackets: [
		{ open: "{", close: "}", token: "delimiter.curly" },
		{ open: "[", close: "]", token: "delimiter.square" },
		{ open: "(", close: ")", token: "delimiter.parenthesis" },
	],
	tokenizer: {
		root: [
			{ include: "@whitespace" },
			{ include: "@numbers" },
			{ include: "@strings" },
			[/[,:;]/, "delimiter"],
			[/[{}[\]()]/, "@brackets"],
			// Python operators
			[/[+\-*/%&|^~<>!]/, "operator"],
			[/[=!<>]=?/, "operator"],
			[/\*\*|\/\/|<<|>>/, "operator"],
			[/@[a-zA-Z_]\w*/, "tag"],
			[/[a-zA-Z_]\w*/, { cases: { "@keywords": "keyword", "@default": "identifier" } }],
		],
		whitespace: [
			[/\s+/, "white"],
			[/#.*$/, "comment"],
		],
		endDocString: [
			[/[^']+/, "string"],
			[/\\./, "string"],
			[/'''/, "string", "@popall"],
			[/'/, "string"],
		],
		endDblDocString: [
			[/[^"]+/, "string"],
			[/\\./, "string"],
			[/"""/, "string", "@popall"],
			[/"/, "string"],
		],
		strings: [
			// Raw strings first
			[/r"""/, "string", "@string_raw_triple"],
			[/r'''/, "string", "@string_raw_triple_single"],
			[/r"([^"\\]|\\.)*$/, "string.invalid"],
			[/r"/, "string", "@string_raw_double"],
			[/r'([^'\\]|\\.)*$/, "string.invalid"],
			[/r'/, "string", "@string_raw_single"],
			// F-strings with triple quotes first (longer patterns first)
			[/f"""/, "string", "@fstring_triple"],
			[/f'''/, "string", "@fstring_triple_single"],
			[/f'([^'\\]|\\.)*$/, "string.invalid"],
			[/f'/, "string", "@fstring_single"],
			[/f"([^"\\]|\\.)*$/, "string.invalid"],
			[/f"/, "string", "@fstring_double"],
			// Triple quoted strings before single/double (longer patterns first)
			[/"""/, "string", "@string_triple"],
			[/'''/, "string", "@string_triple_single"],
			// Single and double quoted strings
			[/'([^'\\]|\\.)*$/, "string.invalid"],
			[/'/, "string", "@string_single"],
			[/"([^"\\]|\\.)*$/, "string.invalid"],
			[/"/, "string", "@string_double"],
		],
		string_double: [
			[/[^\\"]+/, "string"],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/"/, "string", "@pop"],
		],
		string_single: [
			[/[^\\']+/, "string"],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/'/, "string", "@pop"],
		],
		string_triple: [
			[/[^"\\]+/, "string"],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/"""/, "string", "@pop"],
			[/"/, "string"],
		],
		string_triple_single: [
			[/[^'\\]+/, "string"],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/'''/, "string", "@pop"],
			[/'/, "string"],
		],
		fstring_double: [
			[/[^\\"{]+/, "string"],
			[/\{/, "string.escape", "@fstring_expression"],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/"/, "string", "@pop"],
		],
		fstring_single: [
			[/[^\\''{]+/, "string"],
			[/\{/, "string.escape", "@fstring_expression"],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/'/, "string", "@pop"],
		],
		fstring_triple: [
			[/[^"\\{]+/, "string"],
			[/\{/, "string.escape", "@fstring_expression"],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/"""/, "string", "@pop"],
			[/"/, "string"],
		],
		fstring_triple_single: [
			[/[^'\\{]+/, "string"],
			[/\{/, "string.escape", "@fstring_expression"],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/'''/, "string", "@pop"],
			[/'/, "string"],
		],
		// Raw string handlers (no escape processing)
		string_raw_single: [
			[/[^']+/, "string"],
			[/'/, "string", "@pop"],
		],
		string_raw_double: [
			[/[^"]+/, "string"],
			[/"/, "string", "@pop"],
		],
		string_raw_triple: [
			[/[^"]+/, "string"],
			[/"""/, "string", "@pop"],
			[/"/, "string"],
		],
		string_raw_triple_single: [
			[/[^']+/, "string"],
			[/'''/, "string", "@pop"],
			[/'/, "string"],
		],
		fstring_expression: [
			// Basic Python expression tokenization inside f-strings
			[/\s+/, "white"],
			[/[a-zA-Z_]\w*/, "identifier"],
			[/\d+/, "number"],
			[/[+\-*/%&|^~<>!=]/, "operator"],
			[/[()[\].]/, "delimiter"],
			[/['"]/, "string", "@fstring_nested_string"],
			[/:/, "delimiter"], // For format specifiers like :.2f
			[/[^}]+/, "string"], // Fallback for other content
			[/\}/, "string.escape", "@pop"],
		],
		fstring_nested_string: [
			[/[^'"\\]+/, "string"],
			[/\\./, "string.escape"],
			[/['"]/, "string", "@pop"],
		],
		numbers: [
			// Complex numbers (must come first)
			[/\d+[._\d]*[jJ]/, "number.complex"],
			[/\d*\.\d+(?:[eE][+-]?\d+)?[jJ]/, "number.complex"],
			// Hex numbers with underscores
			[/0[xX][0-9a-fA-F]+(?:_[0-9a-fA-F]+)*/, "number.hex"],
			// Binary numbers with underscores
			[/0[bB][01]+(?:_[01]+)*/, "number.binary"],
			// Octal numbers (Python 3 style with 0o prefix)
			[/0[oO][0-7]+(?:_[0-7]+)*/, "number.octal"],
			// Float numbers with underscores and scientific notation
			[/\d+(?:_\d+)*\.\d+(?:_\d+)*(?:[eE][+-]?\d+(?:_\d+)*)?/, "number.float"],
			[/\d+(?:_\d+)*[eE][+-]?\d+(?:_\d+)*/, "number.float"],
			[/\.\d+(?:_\d+)*(?:[eE][+-]?\d+(?:_\d+)*)?/, "number.float"],
			// Integer numbers with underscores
			[/\d+(?:_\d+)*/, "number"],
		],
	},
	escapes: /\\(?:[abfnrtv\\'"]|\\|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8}|N\{[^}]+\}|[0-7]{1,3})/,
};

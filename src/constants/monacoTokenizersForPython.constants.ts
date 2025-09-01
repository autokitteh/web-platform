import { languages } from "monaco-editor";

export const pythonTokenizerConfig: languages.IMonarchLanguage = {
	defaultToken: "",
	tokenPostfix: ".python",
	keywords: [
		// Python 3 keywords only
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
	builtins: [
		// Common built-in functions (optional - can be highlighted differently)
		"abs",
		"all",
		"any",
		"bin",
		"bool",
		"bytearray",
		"bytes",
		"callable",
		"chr",
		"classmethod",
		"compile",
		"complex",
		"delattr",
		"dict",
		"dir",
		"divmod",
		"enumerate",
		"eval",
		"exec",
		"filter",
		"float",
		"format",
		"frozenset",
		"getattr",
		"globals",
		"hasattr",
		"hash",
		"help",
		"hex",
		"id",
		"input",
		"int",
		"isinstance",
		"issubclass",
		"iter",
		"len",
		"list",
		"locals",
		"map",
		"max",
		"memoryview",
		"min",
		"next",
		"object",
		"oct",
		"open",
		"ord",
		"pow",
		"print",
		"property",
		"range",
		"repr",
		"reversed",
		"round",
		"set",
		"setattr",
		"slice",
		"sorted",
		"staticmethod",
		"str",
		"sum",
		"super",
		"tuple",
		"type",
		"vars",
		"zip",
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
			// Python operators (more comprehensive)
			[/[+\-*/%&|^~<>!]/, "operator"],
			[/[=!<>]=?/, "operator"],
			[/\*\*|\/\/|<<|>>/, "operator"],
			[/@[a-zA-Z_]\w*/, "tag"], // decorators
			[
				/[a-zA-Z_]\w*/,
				{
					cases: {
						"@keywords": "keyword",
						"@builtins": "type.identifier",
						"@default": "identifier",
					},
				},
			],
		],
		whitespace: [
			[/\s+/, "white"],
			[/#.*$/, "comment"],
		],
		strings: [
			// CRITICAL FIX: Handle f-strings with triple quotes BEFORE regular triple quotes
			// This prevents the tokenizer from getting confused about f-string boundaries
			[/[fF]"""/, "string", "@fstring_triple_double"],
			[/[fF]'''/, "string", "@fstring_triple_single"],
			[/[fF]"/, "string", "@fstring_double"],
			[/[fF]'/, "string", "@fstring_single"],

			// Raw strings
			[/[rR]"""/, "string", "@string_raw_triple_double"],
			[/[rR]'''/, "string", "@string_raw_triple_single"],
			[/[rR]"/, "string", "@string_raw_double"],
			[/[rR]'/, "string", "@string_raw_single"],

			// Regular triple quoted strings
			[/"""/, "string", "@string_triple_double"],
			[/'''/, "string", "@string_triple_single"],

			// Single and double quoted strings
			[/"/, "string", "@string_double"],
			[/'/, "string", "@string_single"],

			// Invalid strings (unclosed)
			[/"([^"\\]|\\.)*$/, "string.invalid"],
			[/'([^'\\]|\\.)*$/, "string.invalid"],
		],

		// Regular string states
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
		string_triple_double: [
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

		// F-string states - CRITICAL: Proper handling of expressions
		fstring_double: [
			[/[^\\"{]+/, "string"],
			[/\{/, { token: "string.escape", next: "@fstring_expression" }],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/"/, "string", "@pop"],
		],
		fstring_single: [
			[/[^\\''{]+/, "string"],
			[/\{/, { token: "string.escape", next: "@fstring_expression" }],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/'/, "string", "@pop"],
		],
		fstring_triple_double: [
			[/[^"\\{]+/, "string"],
			[/\{/, { token: "string.escape", next: "@fstring_expression" }],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/"""/, "string", "@pop"], // CRITICAL: This must match exactly
			[/"/, "string"], // Single quotes inside are just string content
		],
		fstring_triple_single: [
			[/[^'\\{]+/, "string"],
			[/\{/, { token: "string.escape", next: "@fstring_expression" }],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/'''/, "string", "@pop"], // CRITICAL: This must match exactly
			[/'/, "string"], // Single quotes inside are just string content
		],

		// F-string expression handling
		fstring_expression: [
			[/\s+/, "white"],
			[/#.*$/, "comment"],
			// Handle nested strings inside f-string expressions
			[/"/, "string", "@fstring_nested_string_double"],
			[/'/, "string", "@fstring_nested_string_single"],
			// Python tokens inside expressions
			[
				/[a-zA-Z_]\w*/,
				{
					cases: {
						"@keywords": "keyword",
						"@builtins": "type.identifier",
						"@default": "identifier",
					},
				},
			],
			[/@numbers/, "number"],
			[/[+\-*/%&|^~<>!=]/, "operator"],
			[/[()[\].]/, "delimiter"],
			[/:/, "delimiter"], // Format specifiers
			[/!/, "operator"], // Conversion specifiers (!r, !s, !a)
			[/\}/, { token: "string.escape", next: "@pop" }], // End of expression
			[/[^}]+/, "identifier"], // Fallback for complex expressions
		],

		// Nested strings inside f-string expressions
		fstring_nested_string_double: [
			[/[^\\"]+/, "string"],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/"/, "string", "@pop"],
		],
		fstring_nested_string_single: [
			[/[^\\']+/, "string"],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/'/, "string", "@pop"],
		],

		// Raw string states (no escape processing)
		string_raw_double: [
			[/[^"]+/, "string"],
			[/"/, "string", "@pop"],
		],
		string_raw_single: [
			[/[^']+/, "string"],
			[/'/, "string", "@pop"],
		],
		string_raw_triple_double: [
			[/[^"]+/, "string"],
			[/"""/, "string", "@pop"],
			[/"/, "string"],
		],
		string_raw_triple_single: [
			[/[^']+/, "string"],
			[/'''/, "string", "@pop"],
			[/'/, "string"],
		],

		// Number tokenization with modern Python support
		numbers: [
			// Complex numbers
			[/\d+[._\d]*[jJ]/, "number.complex"],
			[/\d*\.\d+(?:[eE][+-]?\d+)?[jJ]/, "number.complex"],
			// Hexadecimal with underscores
			[/0[xX][0-9a-fA-F]+(?:_[0-9a-fA-F]+)*/, "number.hex"],
			// Binary with underscores
			[/0[bB][01]+(?:_[01]+)*/, "number.binary"],
			// Octal (Python 3 style)
			[/0[oO][0-7]+(?:_[0-7]+)*/, "number.octal"],
			// Float with underscores and scientific notation
			[/\d+(?:_\d+)*\.\d+(?:_\d+)*(?:[eE][+-]?\d+(?:_\d+)*)?/, "number.float"],
			[/\d+(?:_\d+)*[eE][+-]?\d+(?:_\d+)*/, "number.float"],
			[/\.\d+(?:_\d+)*(?:[eE][+-]?\d+(?:_\d+)*)?/, "number.float"],
			// Integer with underscores
			[/\d+(?:_\d+)*/, "number"],
		],
	},

	// Python escape sequences
	escapes: /\\(?:[abfnrtv\\'"]|\\|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8}|N\{[^}]+\}|[0-7]{1,3})/,
};

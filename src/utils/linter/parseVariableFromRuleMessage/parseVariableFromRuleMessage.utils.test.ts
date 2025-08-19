import { parseVariableFromRuleMessage } from "./parseVariableFromRuleMessage.utils";

describe("parseVariableFromRuleMessage", () => {
	describe("Valid message formats", () => {
		it("should extract variable name from standard W1 message format", () => {
			const result = parseVariableFromRuleMessage('variable "APPROVAL_CHANNEL" is empty');
			expect(result).toBe("APPROVAL_CHANNEL");
		});

		it("should extract variable name with numbers and underscores", () => {
			const result = parseVariableFromRuleMessage('variable "API_KEY_123" is empty');
			expect(result).toBe("API_KEY_123");
		});

		it("should extract variable name with special characters", () => {
			const result = parseVariableFromRuleMessage('variable "SPECIAL-CHARS_$" is empty');
			expect(result).toBe("SPECIAL-CHARS_$");
		});

		it("should handle case insensitive matching", () => {
			const result = parseVariableFromRuleMessage('Variable "TEST_VAR" Is Empty');
			expect(result).toBe("TEST_VAR");
		});

		it("should handle extra whitespace in message", () => {
			const result = parseVariableFromRuleMessage('variable   "SPACED_VAR"   is   empty');
			expect(result).toBe("SPACED_VAR");
		});

		it("should extract variable name with dots and hyphens", () => {
			const result = parseVariableFromRuleMessage('variable "CONFIG.API-KEY" is empty');
			expect(result).toBe("CONFIG.API-KEY");
		});

		it("should handle variable names with numbers at start", () => {
			const result = parseVariableFromRuleMessage('variable "123_TEST_VAR" is empty');
			expect(result).toBe("123_TEST_VAR");
		});
	});

	describe("Invalid message formats", () => {
		it("should return null for malformed message without quotes", () => {
			const result = parseVariableFromRuleMessage("variable APPROVAL_CHANNEL is empty");
			expect(result).toBe(null);
		});

		it('should return null for message missing "is empty"', () => {
			const result = parseVariableFromRuleMessage('variable "APPROVAL_CHANNEL"');
			expect(result).toBe(null);
		});

		it('should return null for message missing "variable" keyword', () => {
			const result = parseVariableFromRuleMessage('"APPROVAL_CHANNEL" is empty');
			expect(result).toBe(null);
		});

		it("should return null for completely unrelated message", () => {
			const result = parseVariableFromRuleMessage("This is a random error message");
			expect(result).toBe(null);
		});

		it("should return null for message with mismatched quotes", () => {
			const result = parseVariableFromRuleMessage("variable \"APPROVAL_CHANNEL' is empty");
			expect(result).toBe(null);
		});

		it("should return null for message with empty variable name", () => {
			const result = parseVariableFromRuleMessage('variable "" is empty');
			expect(result).toBe(null);
		});

		it("should return null for message with only whitespace in quotes", () => {
			const result = parseVariableFromRuleMessage('variable "   " is empty');
			expect(result).toBe(null);
		});
	});

	describe("Edge cases and error handling", () => {
		it("should return null for null input", () => {
			const result = parseVariableFromRuleMessage(null);
			expect(result).toBe(null);
		});

		it("should return null for undefined input", () => {
			const result = parseVariableFromRuleMessage(undefined);
			expect(result).toBe(null);
		});

		it("should return null for empty string input", () => {
			const result = parseVariableFromRuleMessage("");
			expect(result).toBe(null);
		});

		it("should return null for whitespace-only input", () => {
			const result = parseVariableFromRuleMessage("   ");
			expect(result).toBe(null);
		});

		it("should handle non-string input gracefully", () => {
			// @ts-expect-error Testing runtime behavior with invalid input
			const result = parseVariableFromRuleMessage(123);
			expect(result).toBe(null);
		});

		it("should handle object input gracefully", () => {
			// @ts-expect-error Testing runtime behavior with invalid input
			const result = parseVariableFromRuleMessage({});
			expect(result).toBe(null);
		});

		it("should extract first variable name when multiple quoted strings exist", () => {
			const result = parseVariableFromRuleMessage('variable "FIRST_VAR" is empty and "SECOND_VAR" too');
			expect(result).toBe("FIRST_VAR");
		});

		it("should handle very long variable names", () => {
			const longVariableName = "A".repeat(100);
			const result = parseVariableFromRuleMessage(`variable "${longVariableName}" is empty`);
			expect(result).toBe(longVariableName);
		});

		it("should handle unicode characters in variable names", () => {
			const result = parseVariableFromRuleMessage('variable "TEST_VAR_ñ_ü_é" is empty');
			expect(result).toBe("TEST_VAR_ñ_ü_é");
		});
	});

	describe("Requirements validation", () => {
		// Requirement 4.1: Extract variable name without quotes
		it("should extract variable name without quotes (Requirement 4.1)", () => {
			const result = parseVariableFromRuleMessage('variable "APPROVAL_CHANNEL" is empty');
			expect(result).toBe("APPROVAL_CHANNEL");
			expect(result).not.toContain('"');
		});

		// Requirement 4.2: Handle standard format
		it('should handle standard format "variable VARIABLE_NAME is empty" (Requirement 4.2)', () => {
			const result = parseVariableFromRuleMessage('variable "TEST_VARIABLE" is empty');
			expect(result).toBe("TEST_VARIABLE");
		});

		// Requirement 4.3: Preserve special characters
		it("should preserve special characters in variable names (Requirement 4.3)", () => {
			const specialChars = "VAR_WITH-SPECIAL.CHARS$123";
			const result = parseVariableFromRuleMessage(`variable "${specialChars}" is empty`);
			expect(result).toBe(specialChars);
		});

		// Requirement 4.4: Extract first quoted string after "variable"
		it('should extract first quoted string after "variable" when multiple exist (Requirement 4.4)', () => {
			const result = parseVariableFromRuleMessage('variable "FIRST_VAR" is empty, also check "SECOND_VAR"');
			expect(result).toBe("FIRST_VAR");
		});
	});
});

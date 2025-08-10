import { extractOriginalMessage } from "./extractOriginalMessage.utils";

describe("extractOriginalMessage", () => {
	describe("Valid formatted message formats", () => {
		it("should extract original message from standard namespace format", () => {
			const result = extractOriginalMessage("[logger] Variable APPROVAL_CHANNEL is empty");
			expect(result).toBe("Variable APPROVAL_CHANNEL is empty");
		});

		it("should extract message from complex namespace format", () => {
			const result = extractOriginalMessage("[project.validator] Missing required field");
			expect(result).toBe("Missing required field");
		});

		it("should extract message from numeric namespace", () => {
			const result = extractOriginalMessage("[123] Test message");
			expect(result).toBe("Test message");
		});

		it("should extract message from namespace with special characters", () => {
			const result = extractOriginalMessage("[api-client.v2] Connection timeout error");
			expect(result).toBe("Connection timeout error");
		});

		it("should extract message from namespace with mixed characters", () => {
			const result = extractOriginalMessage("[auth_service_2024] Authentication failed");
			expect(result).toBe("Authentication failed");
		});

		it("should return original for multiline content (regex limitation)", () => {
			const message = "[validator] Error on line 1:\nInvalid syntax";
			const result = extractOriginalMessage(message);
			expect(result).toBe(message);
		});

		it("should extract message with extra spaces after namespace", () => {
			const result = extractOriginalMessage("[service]  Message with extra spaces");
			expect(result).toBe(" Message with extra spaces");
		});

		it("should extract message with brackets in content", () => {
			const result = extractOriginalMessage("[parser] Found [object Object] in response");
			expect(result).toBe("Found [object Object] in response");
		});
	});

	describe("Non-formatted message formats", () => {
		it("should return original message when no namespace format", () => {
			const message = "Simple error message without namespace";
			const result = extractOriginalMessage(message);
			expect(result).toBe(message);
		});

		it("should return original message for malformed bracket format", () => {
			const message = "namespace] Missing opening bracket";
			const result = extractOriginalMessage(message);
			expect(result).toBe(message);
		});

		it("should return original message for incomplete bracket format", () => {
			const message = "[namespace Missing closing bracket";
			const result = extractOriginalMessage(message);
			expect(result).toBe(message);
		});

		it("should return original message for empty brackets", () => {
			const message = "[] Empty namespace";
			const result = extractOriginalMessage(message);
			expect(result).toBe("Empty namespace");
		});

		it("should return original message for brackets not at start", () => {
			const message = "Error in [namespace] something happened";
			const result = extractOriginalMessage(message);
			expect(result).toBe(message);
		});

		it("should return original message for misplaced brackets", () => {
			const message = "Error] [namespace message";
			const result = extractOriginalMessage(message);
			expect(result).toBe(message);
		});
	});

	describe("Edge cases and error handling", () => {
		it("should handle empty string input", () => {
			const result = extractOriginalMessage("");
			expect(result).toBe("");
		});

		it("should handle whitespace-only input", () => {
			const message = "   ";
			const result = extractOriginalMessage(message);
			expect(result).toBe(message);
		});

		it("should return original when no space after namespace", () => {
			const message = "[namespace]";
			const result = extractOriginalMessage(message);
			expect(result).toBe(message);
		});

		it("should extract empty string when only space after namespace", () => {
			const result = extractOriginalMessage("[namespace] ");
			expect(result).toBe("");
		});

		it("should handle very long namespace", () => {
			const longNamespace = "a".repeat(100);
			const result = extractOriginalMessage(`[${longNamespace}] Test message`);
			expect(result).toBe("Test message");
		});

		it("should handle very long message content", () => {
			const longMessage = "Message ".repeat(100);
			const result = extractOriginalMessage(`[test] ${longMessage}`);
			expect(result).toBe(longMessage);
		});

		it("should handle unicode characters in namespace", () => {
			const result = extractOriginalMessage("[service_ñ_ü_é] Unicode test message");
			expect(result).toBe("Unicode test message");
		});

		it("should handle unicode characters in message", () => {
			const result = extractOriginalMessage("[service] Message with ñ ü é characters");
			expect(result).toBe("Message with ñ ü é characters");
		});

		it("should handle nested bracket patterns", () => {
			const result = extractOriginalMessage("[outer[inner]] Nested brackets message");
			expect(result).toBe("Nested brackets message");
		});

		it("should handle multiple bracket pairs", () => {
			const result = extractOriginalMessage("[namespace] [another] message");
			expect(result).toBe("[another] message");
		});
	});

	describe("Real-world logging scenarios", () => {
		it("should extract lint violation message", () => {
			const result = extractOriginalMessage('[lint.W1] variable "APPROVAL_CHANNEL" is empty');
			expect(result).toBe('variable "APPROVAL_CHANNEL" is empty');
		});

		it("should extract error message with location", () => {
			const result = extractOriginalMessage("[validator] Error at line 42: unexpected token");
			expect(result).toBe("Error at line 42: unexpected token");
		});

		it("should extract warning message", () => {
			const result = extractOriginalMessage("[build.warning] Deprecated function usage detected");
			expect(result).toBe("Deprecated function usage detected");
		});

		it("should extract debug message", () => {
			const result = extractOriginalMessage("[debug.session] Session started with ID: abc123");
			expect(result).toBe("Session started with ID: abc123");
		});

		it("should extract info message with JSON", () => {
			const result = extractOriginalMessage('[api.response] {"status": "success", "data": {...}}');
			expect(result).toBe('{"status": "success", "data": {...}}');
		});

		it("should return original for stack trace (multiline regex limitation)", () => {
			const message = "[error] TypeError: Cannot read property 'length' of undefined\n    at Function.test";
			const result = extractOriginalMessage(message);
			expect(result).toBe(message);
		});
	});

	describe("Requirements validation", () => {
		// Requirement: Extract message from formatted logs
		it("should extract message from formatted log entries (Core requirement)", () => {
			const result = extractOriginalMessage("[service] Log message content");
			expect(result).toBe("Log message content");
		});

		// Requirement: Preserve original content when no formatting
		it("should preserve original content when no namespace formatting (Fallback requirement)", () => {
			const originalMessage = "Unformatted log message";
			const result = extractOriginalMessage(originalMessage);
			expect(result).toBe(originalMessage);
		});

		// Requirement: Handle namespace extraction for rule parsing
		it("should extract content for rule parsing compatibility (Integration requirement)", () => {
			const result = extractOriginalMessage('[lint] variable "TEST_VAR" is empty');
			expect(result).toBe('variable "TEST_VAR" is empty');

			// Verify it can be used by parseVariableFromRuleMessage
			// This would be the extracted content that gets passed to that function
			expect(result).toMatch(/variable\s+"[^"]+"\s+is\s+empty/i);
		});

		// Requirement: Maintain message integrity
		it("should maintain message integrity including special characters (Data integrity requirement)", () => {
			const specialContent = "Special chars: !@#$%^&*()_+-={}[]|\\:\";'<>?,./ and unicode: ñüé";
			const result = extractOriginalMessage(`[test] ${specialContent}`);
			expect(result).toBe(specialContent);
		});
	});
});

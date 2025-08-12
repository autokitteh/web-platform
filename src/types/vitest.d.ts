/// <reference types="vitest/globals" />

import type { TestAPI, ExpectStatic } from "vitest";

declare global {
	const describe: TestAPI["describe"];
	const it: TestAPI["it"];
	const test: TestAPI["test"];
	const expect: ExpectStatic;
	const beforeAll: TestAPI["beforeAll"];
	const afterAll: TestAPI["afterAll"];
	const beforeEach: TestAPI["beforeEach"];
	const afterEach: TestAPI["afterEach"];
	const vi: (typeof import("vitest"))["vi"];
}

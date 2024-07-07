import { afterEach, expect } from "vitest";

import matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

// extends Vitest's expect method with methods from react-testing-library

expect.extend(matchers);

// runs a cleanup after each test case (e.g. clearing jsdom)

afterEach(() => {
	cleanup();
});

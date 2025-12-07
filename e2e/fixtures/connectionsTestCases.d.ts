declare module "./connectionsTestCases.json" {
	interface ConnectionTestCase {
		authLabel?: string | null;
		authType?: string | null;
		category: "single-type" | "multi-type";
		integration: string;
		label: string;
		testName: string;
	}

	const value: ConnectionTestCase[];
	export default value;
}

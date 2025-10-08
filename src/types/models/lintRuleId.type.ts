import { lintRuleIds } from "@constants/lintRules.constants";

export type LintRuleId = (typeof lintRuleIds)[keyof typeof lintRuleIds];

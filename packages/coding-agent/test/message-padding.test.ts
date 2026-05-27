import { beforeAll, describe, expect, test } from "vitest";
import { AssistantMessageComponent } from "../src/modes/interactive/components/assistant-message.ts";
import { BranchSummaryMessageComponent } from "../src/modes/interactive/components/branch-summary-message.ts";
import { CompactionSummaryMessageComponent } from "../src/modes/interactive/components/compaction-summary-message.ts";
import { SkillInvocationMessageComponent } from "../src/modes/interactive/components/skill-invocation-message.ts";
import { initTheme } from "../src/modes/interactive/theme/theme.ts";

const stripAnsi = (text: string) =>
	text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "").replace(/\x1b\][^\x07]*(?:\x07|\x1b\\)/g, "");

describe("interactive message padding", () => {
	beforeAll(() => {
		initTheme("dark");
	});

	test("assistant messages render without a leading left pad", () => {
		const component = new AssistantMessageComponent({
			role: "assistant",
			content: [{ type: "text", text: "hello" }],
			api: "anthropic-messages",
			provider: "anthropic",
			model: "test",
			usage: {
				input: 1,
				output: 1,
				cacheRead: 0,
				cacheWrite: 0,
				totalTokens: 2,
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
			},
			stopReason: "stop",
			timestamp: Date.now(),
		});

		const lines = component.render(40).map((line) => stripAnsi(line));
		const messageLine = lines.find((line) => line.includes("hello"));
		expect(messageLine).toBeDefined();
		expect(messageLine?.startsWith("hello")).toBe(true);
	});

	test("compaction summary messages render without a leading left pad", () => {
		const component = new CompactionSummaryMessageComponent({
			role: "compactionSummary",
			summary: "short summary",
			tokensBefore: 1234,
			timestamp: Date.now(),
		});

		const lines = component.render(80).map((line) => stripAnsi(line));
		const messageLine = lines.find((line) => line.includes("Compacted from"));
		expect(messageLine).toBeDefined();
		expect(messageLine?.startsWith("Compacted from")).toBe(true);
	});

	test("branch summary messages render without a leading left pad", () => {
		const component = new BranchSummaryMessageComponent({
			role: "branchSummary",
			summary: "branch summary",
			fromId: "msg-1",
			timestamp: Date.now(),
		});

		const lines = component.render(80).map((line) => stripAnsi(line));
		const messageLine = lines.find((line) => line.includes("Branch summary"));
		expect(messageLine).toBeDefined();
		expect(messageLine?.startsWith("Branch summary")).toBe(true);
	});

	test("skill invocation messages render without a leading left pad", () => {
		const component = new SkillInvocationMessageComponent({
			name: "research",
			location: "/tmp/research",
			content: "step 1",
			userMessage: undefined,
		});

		const lines = component.render(80).map((line) => stripAnsi(line));
		const messageLine = lines.find((line) => line.includes("research"));
		expect(messageLine).toBeDefined();
		expect(messageLine?.startsWith("[skill] research")).toBe(true);
	});
});

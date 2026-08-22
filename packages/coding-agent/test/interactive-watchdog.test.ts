import { describe, expect, test } from "vitest";
import {
	getBashToolTimeoutDeadline,
	getWatchdogDeadline,
	resolveStuckWorkingTimeoutMs,
} from "../src/modes/interactive/watchdog.ts";

describe("interactive watchdog deadlines", () => {
	test("defers to a longer explicit tool timeout", () => {
		const startedAt = 1_000;
		const toolDeadline = getBashToolTimeoutDeadline({ timeout: 120 }, startedAt, 5_000);

		expect(toolDeadline).toBe(126_000);
		expect(getWatchdogDeadline(startedAt, 90_000, [toolDeadline!])).toBe(126_000);
	});

	test("keeps the watchdog deadline when the tool timeout is shorter", () => {
		const startedAt = 1_000;
		const toolDeadline = getBashToolTimeoutDeadline({ timeout: 30 }, startedAt, 5_000);

		expect(getWatchdogDeadline(startedAt, 90_000, [toolDeadline!])).toBe(91_000);
	});

	test("ignores missing or invalid tool timeouts", () => {
		expect(getBashToolTimeoutDeadline({}, 1_000, 5_000)).toBeUndefined();
		expect(getBashToolTimeoutDeadline({ timeout: 0 }, 1_000, 5_000)).toBeUndefined();
		expect(getBashToolTimeoutDeadline({ timeout: "120" }, 1_000, 5_000)).toBeUndefined();
	});

	test("disables the watchdog by default and allows enabling it", () => {
		expect(resolveStuckWorkingTimeoutMs(undefined)).toBe(0);
		expect(resolveStuckWorkingTimeoutMs("not-a-number")).toBe(0);
		expect(resolveStuckWorkingTimeoutMs("0")).toBe(0);
		expect(resolveStuckWorkingTimeoutMs("90000")).toBe(90_000);
	});
});

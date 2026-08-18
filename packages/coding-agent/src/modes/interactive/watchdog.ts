export function resolveStuckWorkingTimeoutMs(rawTimeoutMs: string | undefined): number {
	if (rawTimeoutMs === undefined || rawTimeoutMs.trim() === "") return 90_000;
	const timeoutMs = Number.parseInt(rawTimeoutMs, 10);
	if (!Number.isFinite(timeoutMs) || timeoutMs < 0) return 90_000;
	return timeoutMs;
}

export function getBashToolTimeoutDeadline(args: unknown, startedAt: number, graceMs: number): number | undefined {
	if (typeof args !== "object" || args === null || !("timeout" in args)) return undefined;
	const timeout = (args as { timeout?: unknown }).timeout;
	if (typeof timeout !== "number" || !Number.isFinite(timeout) || timeout <= 0) return undefined;
	return startedAt + timeout * 1000 + graceMs;
}

export function getWatchdogDeadline(
	lastActivityAt: number,
	watchdogTimeoutMs: number,
	activeToolTimeoutDeadlines: Iterable<number>,
): number {
	let deadline = lastActivityAt + watchdogTimeoutMs;
	for (const toolDeadline of activeToolTimeoutDeadlines) {
		deadline = Math.max(deadline, toolDeadline);
	}
	return deadline;
}

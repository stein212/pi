import { type Component, Spacer, Text } from "@earendil-works/pi-tui";
import { theme } from "../theme/theme.ts";

export function formatMessageTimestamp(timestamp: number): string {
	const date = new Date(timestamp);
	const pad = (value: number, width = 2) => String(value).padStart(width, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

export function timestampLine(timestamp: number): Text {
	return new Text(theme.fg("dim", formatMessageTimestamp(timestamp)), 0, 0);
}

export function addTimestampLine(
	container: { addChild(component: Component): void },
	timestamp: number | undefined,
): void {
	if (timestamp === undefined) return;
	container.addChild(timestampLine(timestamp));
}

export function addTimestampBlockStart(
	container: { addChild(component: Component): void },
	timestamp: number | undefined,
): void {
	if (timestamp === undefined) return;
	container.addChild(new Spacer(1));
	container.addChild(timestampLine(timestamp));
	container.addChild(new Spacer(1));
}

export function addTimestampBlockEnd(
	container: { addChild(component: Component): void },
	timestamp: number | undefined,
): void {
	if (timestamp === undefined) return;
	container.addChild(new Spacer(1));
	container.addChild(timestampLine(timestamp));
}

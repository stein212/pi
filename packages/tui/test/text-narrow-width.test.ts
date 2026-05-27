import assert from "node:assert";
import { describe, it } from "node:test";
import { setTimeout } from "node:timers/promises";
import { Loader } from "../src/components/loader.ts";
import { Text } from "../src/components/text.ts";
import type { TUI } from "../src/tui.ts";
import { visibleWidth } from "../src/utils.ts";

function assertLinesFit(lines: string[], width: number): void {
	for (const line of lines) {
		assert.ok(
			visibleWidth(line) <= width,
			`line exceeds width ${width}: visible=${visibleWidth(line)} text=${JSON.stringify(line)}`,
		);
	}
}

describe("Text narrow width rendering", () => {
	it("keeps padded text within a 2-column width", () => {
		const text = new Text("⠴ Working...", 1, 0);

		assertLinesFit(text.render(2), 2);
	});

	it("keeps wide graphemes within a 1-column width", () => {
		const text = new Text("✅", 1, 0);

		assertLinesFit(text.render(1), 1);
	});

	it("keeps background-rendered text within a 1-column width", () => {
		const text = new Text("✅", 1, 0, (line) => `\x1b[48;5;17m${line}\x1b[49m`);

		assertLinesFit(text.render(1), 1);
	});

	it("keeps loader spinner frames within a 2-column width", async () => {
		const tui = { requestRender(): void {} } as unknown as TUI;
		const loader = new Loader(
			tui,
			(text) => text,
			(text) => text,
			"Working...",
		);

		try {
			assertLinesFit(loader.render(2), 2);
			await setTimeout(90);
			assertLinesFit(loader.render(2), 2);
		} finally {
			loader.stop();
		}
	});
});

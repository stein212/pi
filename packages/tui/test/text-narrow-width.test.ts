import assert from "node:assert";
import { describe, it } from "node:test";
import { setTimeout } from "node:timers/promises";
import { Loader } from "../src/components/loader.ts";
import { Markdown, type MarkdownTheme } from "../src/components/markdown.ts";
import { Text } from "../src/components/text.ts";
import type { TUI } from "../src/tui.ts";
import { visibleWidth } from "../src/utils.ts";

const testMarkdownTheme: MarkdownTheme = {
	heading: (text) => text,
	link: (text) => text,
	linkUrl: (text) => text,
	code: (text) => text,
	codeBlock: (text) => text,
	codeBlockBorder: (text) => text,
	quote: (text) => text,
	quoteBorder: (text) => text,
	hr: (text) => text,
	listBullet: (text) => text,
	bold: (text) => text,
	italic: (text) => text,
	strikethrough: (text) => text,
	underline: (text) => text,
};

const stripAnsi = (text: string): string => text.replace(/\x1b\[[0-9;]*m/g, "");

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

	it("does not prefer left padding when only 5 columns are available", () => {
		const text = new Text("X", 1, 0);
		const line = text.render(5)[0] ?? "";

		assert.equal(visibleWidth(line), 5);
		assert.equal(
			stripAnsi(line).startsWith("X"),
			true,
			`expected content to start at column 0: ${JSON.stringify(line)}`,
		);
	});

	it("does not prefer left padding for markdown at 5 columns", () => {
		const markdown = new Markdown("X", 1, 0, testMarkdownTheme);
		const line = markdown.render(5)[0] ?? "";

		assert.equal(visibleWidth(line), 5);
		assert.equal(
			stripAnsi(line).startsWith("X"),
			true,
			`expected content to start at column 0: ${JSON.stringify(line)}`,
		);
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

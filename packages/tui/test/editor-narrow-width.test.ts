import assert from "node:assert";
import { describe, it } from "node:test";
import { Editor } from "../src/components/editor.ts";
import { visibleWidth } from "../src/utils.ts";

const stripAnsi = (text: string): string => text.replace(/\x1b\[[0-9;]*m/g, "");

describe("Editor narrow width rendering", () => {
	it("keeps the input text flush left at width 5", () => {
		const tui = { terminal: { rows: 24 }, requestRender(): void {} } as never;
		const editor = new Editor(tui, { borderColor: (text: string) => text } as never, { paddingX: 1 });
		editor.setText("X");

		const lines = editor.render(5);
		assert.equal(lines.length >= 3, true);
		assert.equal(visibleWidth(lines[1]), 5);
		assert.equal(
			stripAnsi(lines[1]).startsWith("X"),
			true,
			`expected content to start at column 0: ${JSON.stringify(lines[1])}`,
		);
	});
});

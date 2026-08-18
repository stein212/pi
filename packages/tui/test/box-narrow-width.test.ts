import assert from "node:assert";
import { describe, it } from "node:test";
import { Box } from "../src/components/box.ts";
import { Text } from "../src/components/text.ts";
import { visibleWidth } from "../src/utils.ts";

describe("Box narrow width rendering", () => {
	it("keeps content visible at width 1 instead of consuming the line with left padding", () => {
		const box = new Box(1, 0);
		box.addChild(new Text("X", 0, 0));

		const lines = box.render(1);

		assert.equal(lines.length, 1);
		assert.equal(visibleWidth(lines[0]), 1);
		assert.ok(lines[0].includes("X"), `expected content to remain visible: ${JSON.stringify(lines[0])}`);
	});

	it("keeps content flush left at width 5 instead of preferring left padding", () => {
		const box = new Box(1, 0);
		box.addChild(new Text("X", 0, 0));

		const lines = box.render(5);

		assert.equal(lines.length, 1);
		assert.equal(visibleWidth(lines[0]), 5);
		assert.ok(lines[0].startsWith("X"), `expected content to start at column 0: ${JSON.stringify(lines[0])}`);
	});
});

import assert from "node:assert";
import { describe, it } from "node:test";
import { visibleWidth } from "@earendil-works/pi-tui";
import { UserMessageSelectorComponent } from "../src/modes/interactive/components/user-message-selector.ts";
import { initTheme } from "../src/modes/interactive/theme/theme.ts";

initTheme("dark");

describe("UserMessageSelectorComponent narrow width rendering", () => {
	it("keeps all rendered lines within a 1-column width", () => {
		const selector = new UserMessageSelectorComponent(
			[
				{ id: "1", text: "First message" },
				{ id: "2", text: "Second message" },
			],
			() => {},
			() => {},
		);

		for (const line of selector.render(1)) {
			assert.ok(
				visibleWidth(line) <= 1,
				`line exceeds width 1: visible=${visibleWidth(line)} text=${JSON.stringify(line)}`,
			);
		}
	});
});

import { visibleWidth } from "@earendil-works/pi-tui";
import { describe, expect, it } from "vitest";
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
			expect(visibleWidth(line), `line exceeds width 1: ${JSON.stringify(line)}`).toBeLessThanOrEqual(1);
		}
	});
});

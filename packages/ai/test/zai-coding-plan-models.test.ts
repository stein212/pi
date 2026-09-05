import { expect, it } from "vitest";
import { getBuiltinModel } from "../src/providers/all.ts";

it("exposes the current China Coding Plan vision model", () => {
	const model = getBuiltinModel("zai-coding-cn", "glm-5.3-flash");

	expect(model).toMatchObject({
		id: "glm-5.3-flash",
		provider: "zai-coding-cn",
		api: "openai-completions",
		baseUrl: "https://open.bigmodel.cn/api/coding/paas/v4",
		reasoning: true,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 131072,
		compat: {
			maxTokensField: "max_tokens",
			thinkingFormat: "zai",
			zaiToolStream: true,
		},
	});
});

it("keeps zero costs for Coding Plan models without a matching API price", () => {
	const zeroCost = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

	for (const provider of ["zai", "zai-coding-cn"] as const) {
		expect(getBuiltinModel(provider, "glm-5.2-highspeed").cost).toEqual(zeroCost);
		expect(getBuiltinModel(provider, "glm-5.3").cost).toEqual(zeroCost);
	}
});

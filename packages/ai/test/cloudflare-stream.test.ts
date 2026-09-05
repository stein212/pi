import { describe, expect, it } from "vitest";
import { cloudflareAIGatewayProvider } from "../src/providers/cloudflare-ai-gateway.ts";
import { cloudflareStreams } from "../src/providers/cloudflare-stream.ts";
import type { Context, Model } from "../src/types.ts";
import { AssistantMessageEventStream } from "../src/utils/event-stream.ts";

const model: Model<"openai-completions"> = {
	id: "model",
	name: "model",
	api: "openai-completions",
	provider: "cloudflare-ai-gateway",
	baseUrl: "https://gateway.ai.cloudflare.com/v1/{CLOUDFLARE_ACCOUNT_ID}/{CLOUDFLARE_GATEWAY_ID}/openai",
	reasoning: false,
	input: ["text"],
	cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
	contextWindow: 1000,
	maxTokens: 100,
};

const context: Context = { messages: [] };

describe("Cloudflare provider streams", () => {
	it("dispatches gateway /compat models through OpenAI Completions", async () => {
		const result = await cloudflareAIGatewayProvider().stream(model, context).result();

		expect(result.stopReason).toBe("error");
		expect(result.errorMessage).toContain("No API key for provider");
		expect(result.errorMessage).not.toContain("no API implementation");
	});

	it("materializes the model endpoint before dispatch", () => {
		const captured: string[] = [];
		const streams = cloudflareStreams({
			stream: (requestModel) => {
				captured.push(requestModel.baseUrl);
				return new AssistantMessageEventStream();
			},
			streamSimple: (requestModel) => {
				captured.push(requestModel.baseUrl);
				return new AssistantMessageEventStream();
			},
		});
		const env = {
			CLOUDFLARE_ACCOUNT_ID: "account",
			CLOUDFLARE_GATEWAY_ID: "gateway",
		};

		streams.stream(model, context, { env });
		streams.streamSimple(model, context, { env });

		expect(captured).toEqual([
			"https://gateway.ai.cloudflare.com/v1/account/gateway/openai",
			"https://gateway.ai.cloudflare.com/v1/account/gateway/openai",
		]);
	});

	it("keeps placeholders when the provider env does not resolve them", () => {
		let captured: string | undefined;
		const streams = cloudflareStreams({
			stream: (requestModel) => {
				captured = requestModel.baseUrl;
				return new AssistantMessageEventStream();
			},
			streamSimple: (requestModel) => {
				captured = requestModel.baseUrl;
				return new AssistantMessageEventStream();
			},
		});

		streams.streamSimple(model, context, {});

		expect(captured).toBe(model.baseUrl);
	});
});

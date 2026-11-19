const { test } = require("node:test");
const assert = require("node:assert/strict");
const { sourceLoader } = require("./helpers/load-source.cjs");

test("Mistral speech shares the chat provider but binds only to TTS", () => {
  const load = sourceLoader({ "@/services/ai/llmConfigService": { llmConfigService: {} } });
  const { canBindModel } = load("src/components/lms/admin/llm-config/BindingsPanel.tsx");
  const tts = { adapter_type: "openai_compat", config: { api_protocol: "mistral_speech", catalog_only: false } };
  const chat = { adapter_type: "openai_compat", config: { api_protocol: "chat" } };
  assert.equal(canBindModel("text_to_speech", tts), true);
  assert.equal(canBindModel("chat", tts), false);
  assert.equal(canBindModel("text_to_speech", chat), false);
  assert.equal(canBindModel("chat", chat), true);
  assert.equal(canBindModel("text_to_speech", { ...tts, config: { ...tts.config, catalog_only: true } }), false);
});

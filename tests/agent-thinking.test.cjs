const { test } = require("node:test");
const assert = require("node:assert/strict");
const { hookHarness } = require("./helpers/hook-harness.cjs");

function elements(node) {
  if (!node || typeof node !== "object") return [];
  return [node, ...[node.props?.children].flat(Infinity).flatMap(elements)];
}

test("thinking and running agent logs stay collapsed until the user expands them", () => {
  const noop = () => null;
  const overrides = {
    "@/hooks/common/usePageContext": { usePageContext: () => ({}) },
    "@/services/ai/agentService": {},
    "@/components/markdown/MarkdownRenderer": { __esModule: true, default: noop },
  };
  for (const name of ["AgentThinkingIndicator", "ClarificationCard", "WidgetRenderer", "ActionApprovalCard", "AgentDecisionDetails"]) {
    overrides[`src/components/lms/agent/${name}.tsx`] = { [name]: noop };
  }
  const props = { message: {
    id: "reply", role: "assistant", content: "", thinking: "Check displacement.",
    isStreaming: true, multiAgentLogs: [{ subagentId: "draft", status: "running", thinking: "Check source." }],
  } };
  const h = hookHarness("src/components/lms/agent/AgentMessageItem.tsx", "AgentMessageItem", [props], overrides);
  const toggles = () => elements(h.value).filter(node => node.type === "button" && "aria-expanded" in node.props);
  assert.equal(toggles().length, 2);
  assert.ok(toggles().every(node => node.props["aria-expanded"] === false));
  toggles()[0].props.onClick();
  h.render();
  assert.equal(toggles()[0].props["aria-expanded"], true);
  toggles()[0].props.onClick();
  h.render();
  props.message = { ...props.message, thinking: "Check displacement. Then count.", content: "[10]", isStreaming: false };
  h.render();
  assert.ok(toggles().every(node => node.props["aria-expanded"] === false));
  toggles().at(-1).props.onClick();
  h.render();
  assert.equal(toggles().at(-1).props["aria-expanded"], true);
  h.unmount();
});

test("streamed thinking stays separate, avoids per-token steps and restores from history", async () => {
  const originalFetch = global.fetch;
  const history = [{ id: "42", role: "assistant", content: "[10]", created_at: "2026-11-19", metadata: {
    thinking: "Stored reasoning", multiAgentLogs: [{ subagentId: "draft", thinking: "Stored step", status: "completed" }],
  } }];
  const h = hookHarness("src/hooks/lms/agent/useAgentChat.ts", "useAgentChat", [{ agentType: "mentor" }], {
    "@/lib/tenant/navigation": { usePathname: () => "/" },
    "@/services/ai/agentService": { agentService: { getSessionMessages: async () => history } },
  });
  const events = [
    { type: "thinking", data: { step: "planning", detail: "Choose evidence" } },
    ...Array.from({ length: 100 }, () => ({ type: "thinking", data: { delta: "r" } })),
    { type: "subagent_spawn", data: { subagent_id: "draft", role: "draft", task: "Answer" } },
    { type: "thinking", data: { subagent_id: "draft", delta: "Check rank" } },
    { type: "text_delta", data: { delta: "[10]" } },
    { type: "done", data: { message_id: 42 } },
  ];
  global.fetch = async () => new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join(""));
  try {
    await h.value.sendMessage("Rank 2?");
    h.render();
    const reply = h.value.messages.at(-1);
    assert.equal(reply.content, "[10]");
    assert.equal(reply.thinking, "r".repeat(100));
    assert.equal(reply.thinkingSteps.length, 1);
    assert.equal(reply.multiAgentLogs[0].thinking, "Check rank");
    await h.value.switchSession("saved");
    h.render();
    assert.equal(h.value.messages[0].thinking, "Stored reasoning");
    assert.equal(h.value.messages[0].multiAgentLogs[0].thinking, "Stored step");
  } finally {
    global.fetch = originalFetch;
    h.unmount();
  }
});

test("Audio filter includes audio inputs and speech outputs without vision-only models", () => {
  const models = [
    { id: 1, family: "audio", config: { input_modalities: ["audio"] } },
    { id: 2, family: "custom", config: { output_modalities: ["audio"] } },
    { id: 3, family: "mistral", supports_vision: true, config: { input_modalities: ["text", "image"] } },
  ];
  const h = hookHarness("src/components/lms/admin/llm-config/ModelsPanel.tsx", "ModelsPanel",
    [{ models, providers: [], onChanged() {} }], {
      "@/services/ai/llmConfigService": { llmConfigService: {} },
    });
  const select = elements(h.value).find(node => node.type === "select");
  select.props.onChange({ target: { value: "audio" } });
  h.render();
  const rows = elements(h.value).filter(node => node.props?.model).map(node => node.props.model.id);
  assert.deepEqual(rows, [1, 2]);
  h.unmount();
});

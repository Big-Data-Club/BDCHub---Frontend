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
    isStreaming: true, model: "active-model", multiAgentLogs: [{ subagentId: "draft", status: "running", thinking: "Check source." }],
  } };
  const h = hookHarness("src/components/lms/agent/AgentMessageItem.tsx", "AgentMessageItem", [props], overrides);
  const toggles = () => elements(h.value).filter(node => node.type === "button" && "aria-expanded" in node.props);
  assert.equal(toggles().length, 2);
  assert.ok(elements(h.value).some(node => node.props?.title === "Model đang xử lý lượt này"));
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
    thinking: "Stored reasoning", model: "stored-model", multiAgentLogs: [{ subagentId: "draft", thinking: "Stored step", status: "completed" }],
  } }];
  const h = hookHarness("src/hooks/lms/agent/useAgentChat.ts", "useAgentChat", [{ agentType: "mentor" }], {
    "@/lib/tenant/navigation": { usePathname: () => "/" },
    "@/services/ai/agentService": { agentService: { getSessionMessages: async () => history } },
  });
  const events = [
    { type: "thinking", data: { step: "decision_explanation", explanation: {
      intent: "knowledge_question", mode: "standard", multi_agent_executed: false,
      personalization_requested: false, conversation_turns_used: 3, conversation_tokens: 700,
      durable_memory_used: 0, past_episodes_used: 0, profile_status: "unavailable",
    } } },
    { type: "thinking", data: { step: "planning", detail: "Choose evidence", model: "mistral-medium-latest" } },
    ...Array.from({ length: 100 }, () => ({ type: "thinking", data: { delta: "r" } })),
    { type: "subagent_spawn", data: { subagent_id: "draft", role: "draft", task: "Answer" } },
    { type: "thinking", data: { subagent_id: "draft", delta: "Check rank" } },
    { type: "tool_start", data: { tool: "search_course_materials", call_id: "first" } },
    { type: "tool_start", data: { tool: "search_course_materials", call_id: "first" } },
    { type: "tool_start", data: { tool: "search_course_materials", call_id: "second" } },
    { type: "tool_result", data: { tool: "search_course_materials", call_id: "first", status: "success", message: "First result" } },
    { type: "tool_result", data: { tool: "search_course_materials", call_id: "second", status: "error", message: "Second result" } },
    { type: "text_delta", data: { delta: "[10]" } },
    { type: "done", data: { message_id: 42, retrieval_evidence: {
      retrieval_calls: 6, received_entries: 36, unique_sources: 23, prepared_sources: 12,
      excerpted_sources: 9, cited_sources: 3,
    } } },
  ];
  global.fetch = async () => new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join(""));
  try {
    await h.value.sendMessage("Rank 2?");
    h.render();
    const reply = h.value.messages.at(-1);
    assert.equal(reply.content, "[10]");
    assert.equal(reply.thinking, "r".repeat(100));
    assert.equal(reply.thinkingSteps.length, 2);
    assert.equal(reply.multiAgentLogs[0].thinking, "Check rank");
    assert.equal(reply.model, "mistral-medium-latest");
    assert.equal(reply.decisionExplanation.retrieval_evidence.prepared_sources, 12);
    assert.equal(reply.decisionExplanation.retrieval_evidence.cited_sources, 3);
    assert.equal(reply.toolActivities.length, 2);
    assert.deepEqual(reply.toolActivities.map(t => [t.call_id, t.status, t.message]), [
      ["first", "done", "First result"], ["second", "error", "Second result"],
    ]);
    await h.value.switchSession("saved");
    h.render();
    assert.equal(h.value.messages[0].thinking, "Stored reasoning");
    assert.equal(h.value.messages[0].model, "stored-model");
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

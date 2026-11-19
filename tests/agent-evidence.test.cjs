const { test } = require("node:test");
const assert = require("node:assert/strict");
const { sourceLoader } = require("./helpers/load-source.cjs");

test("references display only cited sources while preserving their original numbers", () => {
  const { selectCitedReferences } = sourceLoader()("src/lib/agent-citations.ts");
  const refs = Array.from({ length: 23 }, (_, i) => ({ title: `Source ${i + 1}`, content: "Source text", relevance_score: .8 }));
  const selected = selectCitedReferences("Agent [ref 5], rewards [3], exploration [ref 12]. `array[1]` ```python\na[2]\n```", refs);
  assert.deepEqual(selected.map(ref => ref.citation_number), [3, 5, 12]);
  assert.equal(selectCitedReferences("General knowledge without citations", refs).length, 0);
  assert.equal(selectCitedReferences("Unrecognized reference [99]", refs).length, 0);
  assert.ok(refs.every(ref => !Object.hasOwn(ref, "citation_number")));
});

test("evidence details distinguish retrieved, prepared, quoted and cited sources", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const { AgentDecisionDetails } = sourceLoader()("src/components/lms/agent/AgentDecisionDetails.tsx");
  const markup = renderToStaticMarkup(React.createElement(AgentDecisionDetails, { explanation: {
    intent: "knowledge_question", mode: "standard", multi_agent_executed: false,
    personalization_requested: false, conversation_turns_used: 3, conversation_tokens: 700,
    durable_memory_used: 0, past_episodes_used: 0, profile_status: "unavailable",
    retrieval_evidence: { retrieval_calls: 6, received_entries: 36, unique_sources: 23,
      prepared_sources: 12, excerpted_sources: 9, cited_sources: 3,
      reader_batches: 4, reader_complete_sources: 23, reader_verified_quotes: 30, reader_pending_segments: 0 },
  } }));
  assert.match(markup, /36 đoạn/);
  assert.match(markup, /23 nguồn sau loại trùng/);
  assert.match(markup, /12 nguồn/);
  assert.match(markup, /Đáp án trích dẫn 3 nguồn/);
  assert.match(markup, /30 trích đoạn khớp bản gốc/);
});

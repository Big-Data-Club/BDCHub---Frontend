const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const file = path.resolve(
  __dirname,
  "../../src/features/workspace/utils/mentorNote.ts",
);
const moduleCode = ts.transpileModule(fs.readFileSync(file, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const loaded = { exports: {} };
new Function("module", "exports", moduleCode)(loaded, loaded.exports);
const { mentorNoteSources, mentorNoteTitle, mentorQuestions } = loaded.exports;

test("a saved note takes its title from the matching question, with a fallback for older replies", () => {
  const questions = mentorQuestions([
    { id: "older", role: "assistant", content: "## Tổng quan" },
    { id: "one", role: "user", content: "OLTP và OLAP khác nhau thế nào?" },
    { id: "first", role: "assistant", content: "Answer" },
    { id: "two", role: "user", content: "Cho mình ví dụ" },
    { id: "follow-up", role: "assistant", content: "Answer again" },
  ]);
  assert.equal(
    mentorNoteTitle(questions.get("older"), "## Tổng quan"),
    "Tổng quan",
  );
  assert.equal(
    mentorNoteTitle(questions.get("first"), "Answer"),
    "OLTP và OLAP khác nhau thế nào?",
  );
  assert.equal(questions.get("follow-up"), "Cho mình ví dụ");
});

test("saving cited sources preserves citation numbers and resolved lesson links without embedding excerpts", async () => {
  const fetchedIds = [];
  const sources = await mentorNoteSources(
    [
      {
        citation_number: 2,
        title: "Bài viết",
        source_type: "web",
        url: "https://example.com/article",
        content: "excerpt",
      },
      {
        citation_number: 3,
        title: "OLAP",
        source_type: "material",
        content_id: 15,
        page_number: 7,
      },
      {
        citation_number: 4,
        title: "OLAP",
        source_type: "material",
        content_id: 15,
        page_number: 11,
      },
      {
        citation_number: 6,
        title: "Tài liệu cũ",
        source_type: "material",
        content_id: 16,
      },
      {
        citation_number: 7,
        title: "Trang lỗi",
        source_type: "web",
        url: "javascript:void(0)",
      },
    ],
    async (id) => {
      fetchedIds.push(id);
      if (id === 16) throw new Error("Access revoked");
      return "/lms/student/courses/3/learn?contentId=15";
    },
  );
  assert.deepEqual(fetchedIds, [15, 16]);
  assert.deepEqual(sources, [
    { type: "url", label: "[2] Bài viết", url: "https://example.com/article" },
    {
      type: "course",
      label: "[3] OLAP · tr. 7",
      url: "/lms/student/courses/3/learn?contentId=15",
    },
    {
      type: "course",
      label: "[4] OLAP · tr. 11",
      url: "/lms/student/courses/3/learn?contentId=15",
    },
    { type: "course", label: "[6] Tài liệu cũ" },
    { type: "url", label: "[7] Trang lỗi" },
  ]);
});

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { hookHarness } = require("./helpers/hook-harness.cjs");

const markdown =
  "## Bài làm\n\n**Lập luận**\n\n```python\nprint(42)\n```\n\n$V(s)$";
const Renderer = () => null;
const rendererOverride = {
  "@/components/markdown/MarkdownRenderer": {
    __esModule: true,
    default: Renderer,
  },
};
function nodes(tree) {
  if (!tree || typeof tree !== "object") return [];
  return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)];
}

test("essay editor preserves Markdown in the existing submission payload", () => {
  const Editor = () => null;
  const writes = [];
  const h = hookHarness(
    "src/components/lms/student/quiz/QuizQuestionCard.tsx",
    "QuizQuestionCard",
    [
      {
        question: {
          id: 42,
          question_type: "ESSAY",
          question_text: "Giải thích",
          settings: {},
        },
        currentIndex: 0,
        totalQuestions: 1,
        answer: { answer_text: markdown },
        onAnswerChange: (...args) => writes.push(args),
        onOpenImageModal() {},
      },
    ],
    {
      ...rendererOverride,
      "@/components/lms/forum/ForumMarkdownEditor": {
        ForumMarkdownEditor: Editor,
      },
      "@/components/lms/student/FillBlankTextStudent": {},
      "@/components/lms/student/FillBlankDropdownStudent": {},
      "@/components/lms/student/FileUploadQuestion": {},
    },
  );
  const editor = nodes(h.value).find((node) => node.type === Editor);
  assert.equal(editor.props.value, markdown);
  editor.props.onChange(markdown + "\n\nKết luận.");
  assert.deepEqual(writes, [
    [42, { type: "essay", answer_text: markdown + "\n\nKết luận." }],
  ]);
  h.unmount();
});

test("preview preserves the draft and formatting targets the correct editor instance", (t) => {
  const previous = global.requestAnimationFrame;
  global.requestAnimationFrame = (callback) => callback();
  t.after(() => {
    global.requestAnimationFrame = previous;
  });
  const writes = [[], []];
  const editors = writes.map((changes) =>
    hookHarness(
      "src/components/lms/forum/ForumMarkdownEditor.tsx",
      "ForumMarkdownEditor",
      [{ value: "hello", onChange: (value) => changes.push(value) }],
      rendererOverride,
    ),
  );
  t.after(() => editors.forEach((h) => h.unmount()));
  editors.forEach((h) => {
    const textarea = nodes(h.value).find((node) => node.type === "textarea");
    textarea.props.ref.current = {
      selectionStart: 0,
      selectionEnd: 5,
      focus() {},
      setSelectionRange() {},
    };
  });
  nodes(editors[1].value)
    .find((node) => node.props?.title === "In đậm")
    .props.onClick();
  assert.deepEqual(writes, [[], ["**hello**"]]);
  nodes(editors[0].value)
    .find(
      (node) => node.type === "button" && node.props.children === "Xem trước",
    )
    .props.onClick();
  editors[0].render();
  assert.equal(
    nodes(editors[0].value).find((node) => node.type === Renderer).props
      .content,
    "hello",
  );
  assert.deepEqual(writes[0], []);
});

test("grading renders question, legacy essay and feedback through the shared renderer", async () => {
  const h = hookHarness(
    "src/app/(learning)/lms/teacher/quiz/[quizId]/grading/page.tsx",
    "default",
    [],
    {
      ...rendererOverride,
      "@/lib/tenant/navigation": {
        useParams: () => ({ quizId: "1" }),
        useRouter: () => ({}),
      },
      "@/components/lms/shared/BreadcrumbNav": {},
      "@/components/lms/shared": {},
      "@/hooks/lms/student/useQuizCourse": { useQuizCourse: () => ({}) },
      "@/services/lms/quizService": {
        __esModule: true,
        default: {
          listAnswersForGrading: async () => ({
            data: [
              {
                id: 1,
                student_name: "Student",
                answered_at: "2026-11-23",
                question_text: "**Question**",
                question_type: "ESSAY",
                answer_data: { text: markdown },
                points: 10,
                points_earned: 8,
                feedback: "**Feedback**",
              },
            ],
          }),
        },
      },
    },
  );
  await h.flush();
  const rendered = nodes(h.value)
    .filter((node) => node.type === Renderer)
    .map((node) => node.props.content);
  assert.deepEqual(rendered, ["**Question**", markdown, "**Feedback**"]);
  h.unmount();
});

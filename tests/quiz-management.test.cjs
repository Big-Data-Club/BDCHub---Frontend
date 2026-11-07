const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');

// Run actual page handlers with isolated hooks and an in-memory API.
function harness() {
  const slots = [], writes = [], alerts = [];
  let cursor = 0, tree, effects = [], fail = false, hold;
  const questions = [1, 2, 3].map(id => ({ id, question_type: 'SINGLE_CHOICE',
    question_text: `Question ${id}\n\nFull second paragraph`, order_index: id, points: 10,
    is_required: id === 2, explanation: 'Original explanation', correct_answers: [],
    answer_options: [{ id: id * 10, option_text: 'Correct long answer', is_correct: true, order_index: 1 },
      { id: id * 10 + 1, option_text: 'Other answer', is_correct: false, order_index: 2 }] }));
  const api = {
    getQuiz: async () => ({ data: { id: 86, title: 'Test quiz' } }),
    listQuestions: async () => ({ data: structuredClone(questions) }),
    listQuestionImages: async () => ({ data: [] }),
    updateQuestion: async (id, payload) => {
      writes.push(structuredClone(payload)); if (hold) await hold;
      if (fail) throw new Error('test failure');
      Object.assign(questions.find(q => q.id === id), structuredClone(payload));
    },
    createQuestion: async (_, payload) => {
      writes.push(structuredClone(payload)); const q = { ...payload, id: 4 };
      questions.push(q); return { data: structuredClone(q) };
    },
  };
  const component = name => Object.assign(() => null, { displayName: name });
  const mocked = name => {
    if (name === 'react/jsx-runtime') return require(name);
    if (name === 'react') return { ...React,
      useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial;
        return [slots[i], v => { slots[i] = typeof v === 'function' ? v(slots[i]) : v; }]; },
      useRef(initial) { const i = cursor++; if (!(i in slots)) slots[i] = { current: initial }; return slots[i]; },
      useEffect(callback) { if (!tree) effects.push(callback); },
    };
    if (name.includes('quizService')) return { __esModule: true, default: api };
    if (name.includes('/navigation')) return { useParams: () => ({ quizId: '86' }), useRouter: () => ({ back() {} }) };
    if (name.includes('useQuizCourse')) return { useQuizCourse: () => ({ courseId: 1, loading: false }) };
    if (name.includes('usePageContext')) return { useSetPageContext: () => ({ setPageContext() {}, clearPageContext() {} }) };
    if (name.includes('useMarkdownImage')) return { useMarkdownImage: () => ({ uploading: false }) };
    const base = name.split('/').at(-1), stub = component(base);
    return { __esModule: true, default: stub, [base]: stub, Select: component('Select') };
  };
  const code = ts.transpileModule(fs.readFileSync('src/app/(learning)/lms/teacher/quiz/[quizId]/manage/page.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', 'alert', code)(mocked, mod, mod.exports, v => alerts.push(v));
  const render = () => { cursor = 0; tree = mod.exports.default(); };
  const nodes = () => { const found = []; const visit = n => {
    if (Array.isArray(n)) return n.forEach(visit);
    if (React.isValidElement(n)) { found.push(n); visit(n.props.children); }
  }; visit(tree); return found; };
  const text = n => Array.isArray(n) ? n.map(text).join('') : React.isValidElement(n) ? text(n.props.children) : String(n ?? '');
  const button = label => nodes().find(n => n.type === 'button' && text(n).includes(label));
  const edit = i => { nodes().filter(n => n.type === 'button' && text(n).includes('Sửa'))[i].props.onClick(); render(); };
  const field = () => nodes().find(n => n.type === 'input' && n.props.type === 'checkbox');
  const explanation = () => nodes().filter(n => n.type.displayName === 'MarkdownEditor').at(-1);
  const save = () => nodes().find(n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  return { render, nodes, button, edit, field, explanation, save, writes, questions, alerts,
    async init() { render(); effects.forEach(f => f()); effects = []; await new Promise(setImmediate); render(); },
    fail(v) { fail = v; }, hold(v) { hold = v; } };
}

test('edit preserves order, required flag, explanation and option IDs after reloading', async () => {
  const h = harness(); await h.init(); h.edit(1);
  assert.equal(h.field().props.checked, true);
  assert.equal(h.explanation().props.value, 'Original explanation');
  h.explanation().props.onChange('Updated explanation'); h.render(); await h.save(); h.render();
  assert.equal('order_index' in h.writes[0], false);
  assert.equal(h.writes[0].is_required, true);
  assert.equal(h.writes[0].answer_options[0].id, 20);
  assert.deepEqual(h.questions.map(q => q.id), [1, 2, 3]);
  h.edit(1); assert.equal(h.explanation().props.value, 'Updated explanation');
  h.field().props.onChange({ target: { checked: false } }); h.explanation().props.onChange('');
  h.render(); await h.save(); h.render(); h.edit(1);
  assert.equal(h.field().props.checked, false); assert.equal(h.explanation().props.value, '');
  h.field().props.onChange({ target: { checked: true } }); h.render(); await h.save(); h.render(); h.edit(1);
  assert.equal(h.field().props.checked, true);
});

test('failed save keeps draft, repeated submissions are blocked, new questions append', async () => {
  const h = harness(); await h.init(); h.edit(1); h.fail(true); await h.save(); h.render();
  assert.equal(h.field().props.checked, true); assert.equal(h.alerts.at(-1), 'Không thể lưu câu hỏi');
  h.fail(false); let release; h.hold(new Promise(resolve => { release = resolve; }));
  const pending = h.save(); h.render(); const count = h.writes.length; await h.save();
  assert.equal(h.writes.length, count); assert.equal(h.button('Đang lưu').props.disabled, true);
  release(); await pending; h.render(); h.button('+ Thêm câu hỏi').props.onClick(); h.render();
  h.nodes().find(n => n.type.displayName === 'MarkdownEditor').props.onChange('New question'); h.render();
  const options = h.nodes().filter(n => n.type === 'textarea');
  options[0].props.onChange({ target: { value: 'A' } }); options[1].props.onChange({ target: { value: 'B' } }); h.render();
  h.nodes().find(n => n.type === 'input' && n.props.type === 'radio').props.onChange({ target: { checked: true } });
  h.render(); await h.save(); assert.equal(h.writes.at(-1).order_index, 4);
});

test('rich previews show full content and save uses native form validation', async () => {
  const h = harness(); await h.init();
  const rich = h.nodes().filter(n => n.type.displayName === 'MarkdownRenderer');
  assert(rich.some(n => n.props.content.includes('Full second paragraph')));
  assert(rich.some(n => n.props.content === 'Correct long answer'));
  assert.equal(h.nodes().some(n => /line-clamp|truncate/.test(n.props.className || '')), false);
  h.edit(1); assert.equal(h.button('Cập nhật câu hỏi').props.type, 'submit');
  assert.equal(h.button('Cập nhật câu hỏi').props.form, 'quiz-question-form');
});

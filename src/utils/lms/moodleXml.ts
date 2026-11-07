import type { ParsedQuestion } from "@/services/ai/aiService";

/** Deterministic, client-only Moodle import; never execute imported markup. */
export function parseMoodleXML(source: string): ParsedQuestion[] {
  if (source.length > 2 * 1024 * 1024 || /<!DOCTYPE|<!ENTITY/i.test(source)) {
    throw new Error("XML quá lớn hoặc chứa DTD/entity không được hỗ trợ.");
  }
  const doc = new DOMParser().parseFromString(source, "application/xml");
  if (doc.querySelector("parsererror") || doc.documentElement.tagName !== "quiz") {
    throw new Error("Tệp phải là Moodle XML hợp lệ với phần tử gốc <quiz>.");
  }
  const text = (el: Element, path: string) => {
    const raw = el.querySelector(path)?.textContent ?? "";
    if (/<\s*(img|audio|video|iframe)\b/i.test(raw)) throw new Error("XML có nội dung đa phương tiện chưa được hỗ trợ.");
    const html = new DOMParser().parseFromString(raw, "text/html");
    if (html.querySelector("img, audio, video, iframe")) throw new Error("XML có nội dung đa phương tiện; hãy chuyển sang văn bản trước khi nhập.");
    html.querySelectorAll("script,style").forEach(n => n.remove());
    return (html.body.textContent ?? "").trim();
  };
  const nodes = Array.from(doc.documentElement.children);
  if (nodes.length > 500) throw new Error("Mỗi lần nhập tối đa 500 câu hỏi.");
  return nodes.filter(q => q.getAttribute("type") !== "category").map((q, index) => {
    const type = q.getAttribute("type");
    if (!["multichoice", "truefalse", "shortanswer", "essay"].includes(type ?? "")) {
      throw new Error(`Câu ${index + 1}: chưa hỗ trợ loại ${type}.`);
    }
    if (q.querySelector("file")) throw new Error(`Câu ${index + 1}: chưa hỗ trợ tệp đính kèm.`);
    const question = text(q, "questiontext > text");
    const grade = q.querySelector("defaultgrade")?.textContent ?? "1";
    const points = Number(grade);
    if (!question || !Number.isFinite(points) || points <= 0) throw new Error(`Câu ${index + 1}: thiếu nội dung hoặc điểm không hợp lệ.`);
    const answers = Array.from(q.children).filter(n => n.tagName === "answer");
    const single = type === "truefalse" || !["false", "0"].includes(q.querySelector("single")?.textContent?.trim().toLowerCase() ?? "true");
    const options = answers.map((a, i) => {
      const fraction = Number(a.getAttribute("fraction"));
      if (!a.hasAttribute("fraction") || !Number.isFinite(fraction) || fraction < 0 || fraction > 100) throw new Error(`Câu ${index + 1}: thiếu trọng số đáp án.`);
      return { option_text: text(a, "text"), is_correct: fraction > 0, order_index: i + 1 };
    });
    const correct = options.filter(o => o.is_correct);
    if (type !== "essay" && (!correct.length || options.some(o => !o.option_text))) throw new Error(`Câu ${index + 1}: đáp án không hợp lệ.`);
    if ((type === "multichoice" || type === "truefalse") && (options.length < 2 || (single && correct.length !== 1))) throw new Error(`Câu ${index + 1}: số đáp án đúng không phù hợp.`);
    // BDC uses binary correctness; reject weighted Moodle grading rather than silently change marks.
    if (type !== "essay" && answers.some(a => Number(a.getAttribute("fraction")) > 0 && Math.abs(Number(a.getAttribute("fraction")) - (single || type === "shortanswer" ? 100 : 100 / correct.length)) > 0.01)) throw new Error(`Câu ${index + 1}: trọng số điểm từng đáp án chưa được hỗ trợ.`);
    return {
      question_type: type === "essay" ? "ESSAY" : type === "shortanswer" ? "SHORT_ANSWER" : single ? "SINGLE_CHOICE" : "MULTIPLE_CHOICE",
      question_text: question, points, order_index: index + 1, explanation: text(q, "generalfeedback > text"), is_required: false,
      answer_options: type === "shortanswer" || type === "essay" ? [] : options,
      correct_answers: type === "shortanswer" ? correct.map(a => ({ answer_text: a.option_text, case_sensitive: q.querySelector("usecase")?.textContent === "1", exact_match: true })) : [],
      settings: null,
    };
  });
}

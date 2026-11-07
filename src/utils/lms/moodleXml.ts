import type { ParsedQuestion } from "@/services/ai/aiService";

export interface MoodleImage {
  token: string;
  fileName: string;
  dataUrl: string;
}
export interface MoodleQuestion extends ParsedQuestion {
  embedded_images?: MoodleImage[];
}

/** Deterministic, client-only Moodle import; never execute imported markup. */
export function parseMoodleXML(source: string): MoodleQuestion[] {
  if (source.length > 2 * 1024 * 1024 || /<!DOCTYPE|<!ENTITY/i.test(source)) {
    throw new Error("XML quá lớn hoặc chứa DTD/entity không được hỗ trợ.");
  }
  const doc = new DOMParser().parseFromString(source, "application/xml");
  if (doc.querySelector("parsererror") || doc.documentElement.tagName !== "quiz") {
    throw new Error("Tệp phải là Moodle XML hợp lệ với phần tử gốc <quiz>.");
  }
  const nodes = Array.from(doc.documentElement.children);
  if (nodes.filter(q => q.getAttribute("type") !== "category").length > 500) throw new Error("Mỗi lần nhập tối đa 500 câu hỏi.");
  return nodes.filter(q => q.getAttribute("type") !== "category").map((q, index) => {
    const type = q.getAttribute("type");
    if (!["multichoice", "truefalse", "shortanswer", "essay"].includes(type ?? "")) {
      throw new Error(`Câu ${index + 1}: chưa hỗ trợ loại ${type}.`);
    }
    const embedded_images: MoodleImage[] = [];
    const files = new Map<string, Element>();
    for (const file of q.querySelectorAll("file")) {
      const name = (file.getAttribute("path") || "/") + file.getAttribute("name");
      if (files.has(name)) throw new Error(`Câu ${index + 1}: tệp trùng tên ${name}.`);
      files.set(name, file);
    }
    const text = (el: Element, path: string) => {
      const node = el.querySelector(path);
      // Moodle exports both CDATA HTML and literal XML child elements.
      const raw = node?.children.length
        ? Array.from(node.childNodes).map(n => new XMLSerializer().serializeToString(n)).join("")
        : node?.textContent ?? "";
      // Template contents are inert: imported tags cannot execute or load remote resources.
      const template = document.createElement("template");
      template.innerHTML = raw;
      const html = template.content;
      if (html.querySelector("audio,video,iframe,object,embed")) throw new Error(`Câu ${index + 1}: chỉ hỗ trợ ảnh PNG, JPEG, GIF, WebP nhúng.`);
      html.querySelectorAll("script,style").forEach(n => n.remove());
      for (const img of html.querySelectorAll("img")) {
        const src = img.getAttribute("src") || "";
        if (!src.startsWith("@@PLUGINFILE@@/")) throw new Error(`Câu ${index + 1}: ảnh phải có tệp nhúng trong XML.`);
        let name: string;
        try { name = decodeURIComponent(src.slice("@@PLUGINFILE@@".length)); }
        catch { throw new Error(`Câu ${index + 1}: đường dẫn ảnh không hợp lệ.`); }
        const file = files.get(name);
        if (!file || file.getAttribute("encoding") !== "base64") throw new Error(`Câu ${index + 1}: thiếu ảnh nhúng ${name}.`);
        let image = embedded_images.find(i => i.fileName === name);
        if (!image) {
          if (embedded_images.length >= 5) throw new Error(`Câu ${index + 1}: tối đa 5 ảnh.`);
          const base64 = (file.textContent || "").replace(/\s/g, "");
          if (!base64 || base64.length > 7 * 1024 * 1024 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) throw new Error(`Câu ${index + 1}: dữ liệu ảnh không hợp lệ.`);
          let bytes: string;
          try { bytes = atob(base64); } catch { throw new Error(`Câu ${index + 1}: base64 ảnh không hợp lệ.`); }
          const mime = bytes.startsWith("\x89PNG\r\n\x1a\n") ? "image/png"
            : bytes.startsWith("\xff\xd8\xff") ? "image/jpeg"
            : /^GIF8[79]a/.test(bytes) ? "image/gif"
            : bytes.startsWith("RIFF") && bytes.slice(8, 12) === "WEBP" ? "image/webp" : null;
          if (!mime || bytes.length > 5 * 1024 * 1024) throw new Error(`Câu ${index + 1}: chỉ hỗ trợ PNG, JPEG, GIF, WebP tối đa 5MB.`);
          image = { token: `bdc-moodle-image-${index}-${embedded_images.length}`, fileName: name, dataUrl: `data:${mime};base64,${base64}` };
          embedded_images.push(image);
        }
        // Store only Markdown and validated image bytes, never imported HTML.
        const alt = (img.getAttribute("alt") || file.getAttribute("name") || "Ảnh").replace(/[\[\]\r\n]/g, " ");
        img.replaceWith(document.createTextNode(`![${alt}](${image.token})`));
      }
      html.querySelectorAll("br").forEach(n => n.replaceWith(document.createTextNode("\n")));
      html.querySelectorAll("p,div,li").forEach(n => n.append(document.createTextNode("\n")));
      return (html.textContent ?? "").trim();
    };
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
      embedded_images,
    };
  });
}

/** Resolve local placeholders only after confirmation, keeping base64 out of LMS JSON. */
export async function resolveMoodleImages(
  question: MoodleQuestion,
  upload: (image: MoodleImage) => Promise<string>,
): Promise<ParsedQuestion> {
  let question_text = question.question_text;
  let explanation = question.explanation ?? "";
  let answer_options = (question.answer_options ?? []).map(option => ({ ...option }));
  const correct_answers = (question.correct_answers ?? []).map(answer => ({ ...answer }));
  for (const image of question.embedded_images ?? []) {
    const url = await upload(image);
    question_text = question_text.split(image.token).join(url);
    explanation = explanation.split(image.token).join(url);
    answer_options = answer_options.map(option => ({ ...option, option_text: option.option_text.split(image.token).join(url) }));
    for (const answer of correct_answers) answer.answer_text = answer.answer_text.split(image.token).join(url);
  }
  const parsed = { ...question };
  delete parsed.embedded_images;
  return { ...parsed, question_text, explanation, answer_options, correct_answers };
}

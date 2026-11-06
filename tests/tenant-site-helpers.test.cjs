const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function load(relative) {
  const source = fs.readFileSync(path.join(__dirname, "..", relative), "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const result = {};
  new Function("require", "exports", js)(require, result);
  return result;
}

const helpers = load("src/features/tenant-site/helpers.ts");

test("hexToRgb converts valid 6-char, 3-char and handles fallback", () => {
  assert.equal(helpers.hexToRgb("#075985"), "7, 89, 133");
  assert.equal(helpers.hexToRgb("#ffffff"), "255, 255, 255");
  assert.equal(helpers.hexToRgb("#000"), "0, 0, 0");
  assert.equal(helpers.hexToRgb("invalid"), "7, 89, 133");
  assert.equal(helpers.hexToRgb(""), "7, 89, 133");
});

test("normalizeMarkdown removes accidental 4-space indent on paragraphs and numbered lists", () => {
  const input = `Trung tâm Kỹ Thuật Điện toán

    Hơn 30 năm hoạt động trong lĩnh vực công nghệ thông tin...

    1. Đào tạo các chứng chỉ tin học.
    2. Nghiên cứu chuyển giao công nghệ.`;

  const normalized = helpers.normalizeMarkdown(input);

  // Paragraph should not have leading 4 spaces
  assert.match(normalized, /Hơn 30 năm hoạt động/);
  assert.doesNotMatch(normalized, /    Hơn 30 năm hoạt động/);

  // Numbered list should start at beginning of line
  assert.match(normalized, /\n1\. Đào tạo/);
  assert.match(normalized, /\n2\. Nghiên cứu/);
});

test("normalizeMarkdown preserves code inside fenced code blocks", () => {
  const input = `\`\`\`js
    const a = 1;
    const b = 2;
\`\`\``;

  const normalized = helpers.normalizeMarkdown(input);
  assert.match(normalized, /    const a = 1;/);
  assert.match(normalized, /    const b = 2;/);
});

test("parsePersonnel accurately parses unformatted personnel entries from user screenshot", () => {
  const raw = `PGS TS. Thoại Nam Chức vụ: Giám đốc Điện thoại: Email: nam@cse.hcmut.edu.vn Website: www.cse.hcmut.edu.vn/~nam Thông tin khác:

TS. Dương Ngọc Hiếu Chức vụ: Phó giám đốc Điện thoại: liên hệ Email: dnhieu@hcmut.edu.vn Website: www.cse.hcmut.edu.vn/~dnhieu Thông tin khác: Chuyên ngành công nghệ thông tin

ThS. Lê Quốc Tuấn Chức vụ: Phó giám đốc Điện thoại: liên hệ Email: lqtuan@hcmut.edu.vn Website: http://www4.hcmut.edu.vn/~lqtuan Thông tin khác: Chuyên ngành công nghệ thông tin

ThS. Ngô Quang Nhựt Chức vụ: Phó giám đốc Điện thoại: 0813 23 04 33 Email: nhutnq@hcmut.edu.vn Chuyên ngành Công nghệ thông tin

CN. Trần Thị Ngọc Diễm Chức vụ: Kế toán trưởng Điện thoại: 01666444566 Email: ngocdiemkt28@gmail.com Website: Thông tin khác:`;

  const members = helpers.parsePersonnel(raw);
  assert.ok(members);
  assert.equal(members.length, 5);

  // Member 1: Giám đốc (Tier 1)
  assert.equal(members[0].name, "PGS TS. Thoại Nam");
  assert.equal(members[0].role, "Giám đốc");
  assert.equal(members[0].email, "nam@cse.hcmut.edu.vn");
  assert.equal(members[0].website, "www.cse.hcmut.edu.vn/~nam");
  assert.equal(members[0].initials, "TN");
  assert.equal(members[0].tier, 1);

  // Member 2: Phó Giám đốc (Tier 2)
  assert.equal(members[1].name, "TS. Dương Ngọc Hiếu");
  assert.equal(members[1].role, "Phó giám đốc");
  assert.equal(members[1].email, "dnhieu@hcmut.edu.vn");
  assert.equal(members[1].initials, "DH");
  assert.equal(members[1].tier, 2);

  // Member 4: Phó Giám đốc with phone (Tier 2)
  assert.equal(members[3].name, "ThS. Ngô Quang Nhựt");
  assert.equal(members[3].role, "Phó giám đốc");
  assert.equal(members[3].phone, "0813 23 04 33");
  assert.equal(members[3].email, "nhutnq@hcmut.edu.vn");
  assert.equal(members[3].tier, 2);

  // Member 5: Kế toán trưởng (Tier 3)
  assert.equal(members[4].name, "CN. Trần Thị Ngọc Diễm");
  assert.equal(members[4].role, "Kế toán trưởng");
  assert.equal(members[4].phone, "01666444566");
  assert.equal(members[4].email, "ngocdiemkt28@gmail.com");
  assert.equal(members[4].tier, 3);
});

test("parsePersonnel returns null for plain non-personnel text", () => {
  const plainText = "Đây là bài viết giới thiệu về lịch sử hình thành của trung tâm qua 30 năm.";
  assert.equal(helpers.parsePersonnel(plainText), null);
});

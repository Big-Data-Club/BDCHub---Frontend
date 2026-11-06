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

test("isOrgChartMarked detects :::org-chart and ```org-chart markers", () => {
  assert.equal(helpers.isOrgChartMarked(":::org-chart\n## Group\n:::"), true);
  assert.equal(helpers.isOrgChartMarked("```org-chart\n## Group\n```"), true);
  assert.equal(helpers.isOrgChartMarked("[org-chart]## Group[/org-chart]"), true);
  assert.equal(helpers.isOrgChartMarked("Bài viết thông thường không có đánh dấu"), false);
});

test("parseOrgChart returns null when no admin marker is present", () => {
  const plainText = `PGS TS. Thoại Nam Chức vụ: Giám đốc Email: nam@cse.hcmut.edu.vn
TS. Dương Ngọc Hiếu Chức vụ: Phó giám đốc Email: dnhieu@hcmut.edu.vn`;

  // Without explicit marker, standard text does NOT turn into org chart
  assert.equal(helpers.parseOrgChart(plainText, false), null);
});

test("parseOrgChart parses dynamic admin-defined groups without hardcoded names", () => {
  const markedText = `Lời mở đầu: Giới thiệu cơ cấu

:::org-chart
## Ban Điều Hành Cấp Cao
- **PGS TS. Thoại Nam** - Tổng Giám đốc
  - Email: nam@cse.hcmut.edu.vn
  - Website: www.cse.hcmut.edu.vn/~nam

## Khối Kỹ Thuật & Công Nghệ AI
- **TS. Nguyễn Văn A** - Trưởng khối AI
  - Email: a@cse.hcmut.edu.vn
  - Chuyên môn: Xử lý ngôn ngữ tự nhiên
- **ThS. Trần Văn B** - Phó khối Hạ tầng
  - Email: b@cse.hcmut.edu.vn

## Khối Tài Chính & Nhân Sự
- **CN. Lê Thị C** - Giám đốc tài chính
  - Điện thoại: 0909123456
  - Email: c@example.com
:::

Lời kết: Liên hệ ban quản trị.`;

  const chart = helpers.parseOrgChart(markedText);
  assert.ok(chart);
  assert.equal(chart.introText, "Lời mở đầu: Giới thiệu cơ cấu");
  assert.equal(chart.outroText, "Lời kết: Liên hệ ban quản trị.");
  assert.equal(chart.groups.length, 3);

  // Group 1: 100% dynamic title from admin!
  assert.equal(chart.groups[0].title, "Ban Điều Hành Cấp Cao");
  assert.equal(chart.groups[0].isRoot, true);
  assert.equal(chart.groups[0].members.length, 1);
  assert.equal(chart.groups[0].members[0].name, "PGS TS. Thoại Nam");
  assert.equal(chart.groups[0].members[0].role, "Tổng Giám đốc");

  // Group 2: 100% dynamic title from admin!
  assert.equal(chart.groups[1].title, "Khối Kỹ Thuật & Công Nghệ AI");
  assert.equal(chart.groups[1].isRoot, false);
  assert.equal(chart.groups[1].members.length, 2);
  assert.equal(chart.groups[1].members[0].name, "TS. Nguyễn Văn A");
  assert.equal(chart.groups[1].members[1].name, "ThS. Trần Văn B");

  // Group 3: 100% dynamic title from admin!
  assert.equal(chart.groups[2].title, "Khối Tài Chính & Nhân Sự");
  assert.equal(chart.groups[2].members.length, 1);
  assert.equal(chart.groups[2].members[0].name, "CN. Lê Thị C");
});

test("parsePersonnel accurately parses unformatted personnel entries with fallback", () => {
  const raw = `PGS TS. Thoại Nam Chức vụ: Giám đốc Điện thoại: Email: nam@cse.hcmut.edu.vn Website: www.cse.hcmut.edu.vn/~nam Thông tin khác:

TS. Dương Ngọc Hiếu Chức vụ: Phó giám đốc Điện thoại: liên hệ Email: dnhieu@hcmut.edu.vn Website: www.cse.hcmut.edu.vn/~dnhieu Thông tin khác: Chuyên ngành công nghệ thông tin

CN. Trần Thị Ngọc Diễm Chức vụ: Kế toán trưởng Điện thoại: 01666444566 Email: ngocdiemkt28@gmail.com Website: Thông tin khác:`;

  const members = helpers.parsePersonnel(raw);
  assert.ok(members);
  assert.equal(members.length, 3);
  assert.equal(members[0].name, "PGS TS. Thoại Nam");
  assert.equal(members[0].role, "Giám đốc");
  assert.equal(members[0].initials, "TN");
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { chromium } = require('@playwright/test');
test('Moodle XML validates answers and rejects malformed or unsupported input', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const code = ts.transpileModule(fs.readFileSync('src/utils/lms/moodleXml.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    await page.addScriptTag({ content: `window.exports = {}; ${code}` });
    const valid = '<quiz><question type="multichoice"><questiontext><text><![CDATA[<b>Hello</b>]]></text></questiontext><single>true</single><answer fraction="100"><text>A</text></answer><answer fraction="0"><text>B</text></answer></question></quiz>';
    const result = await page.evaluate(xml => window.exports.parseMoodleXML(xml), valid);
    assert.equal(result[0].question_text, 'Hello');
    assert.equal(result[0].question_type, 'SINGLE_CHOICE');
    assert.equal(result[0].answer_options[0].is_correct, true);
    for (const invalid of [valid.replace('</quiz>', ''), '<!DOCTYPE quiz>' + valid, valid.replace('fraction="100"', 'fraction="0"'), valid.replace('multichoice', 'matching'), valid.replace('Hello', '<img src="x">')]) {
      assert.equal(await page.evaluate(xml => { try { window.exports.parseMoodleXML(xml); return false; } catch { return true; } }, invalid), true);
    }
  } finally { await browser.close(); }
});

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
    const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=';
    for (const cdata of [false, true]) {
      const markup = '<p>Mô hình OSI chuẩn có bao nhiêu tầng?</p><p><img src="@@PLUGINFILE@@/osi_layers.png" alt="Sơ đồ OSI" /></p>';
      const text = cdata ? `<![CDATA[${markup}]]>` : markup;
      const imageQuestion = `<question type="multichoice"><name><text/></name><questiontext format="html"><text>${text}</text><file name="osi_layers.png" path="/" encoding="base64">${png}</file></questiontext><defaultgrade>1.0000000</defaultgrade><single>true</single><answer fraction="100"><text>7 tầng</text></answer><answer fraction="0"><text>8 tầng</text></answer></question>`;
      const sample = `<quiz><question type="category"><category><text>Networks</text></category></question>${valid.slice(6, -7).repeat(3)}${imageQuestion}</quiz>`;
      const parsed = await page.evaluate(xml => window.exports.parseMoodleXML(xml), sample);
      assert.equal(parsed.length, 4);
      assert.match(parsed[3].question_text, /OSI/);
      assert.equal(parsed[3].embedded_images.length, 1);
      assert.equal(parsed[3].embedded_images[0].dataUrl, `data:image/png;base64,${png}`);
      const saved = await page.evaluate(async question => {
        let calls = 0;
        const result = await window.exports.resolveMoodleImages(question, async () => { calls++; return '/files/osi.png'; });
        return { result, calls };
      }, parsed[3]);
      assert.equal(saved.calls, 1);
      assert.match(saved.result.question_text, /\(\/files\/osi.png\)/);
      assert.equal(JSON.stringify(saved.result).includes('base64'), false);
      assert.equal(JSON.stringify(saved.result).includes('bdc-moodle-image-'), false);
      for (const invalid of [sample.replace(`encoding="base64">${png}`, 'encoding="base64">not-base64'), sample.replace('src="@@PLUGINFILE@@/osi_layers.png"', 'src="https://example.com/image.png"')]) {
        assert.equal(await page.evaluate(xml => { try { window.exports.parseMoodleXML(xml); return false; } catch { return true; } }, invalid), true);
      }
    }
    for (const invalid of [valid.replace('</quiz>', ''), '<!DOCTYPE quiz>' + valid, valid.replace('fraction="100"', 'fraction="0"'), valid.replace('multichoice', 'matching'), valid.replace('Hello', '<img src="x">')]) {
      assert.equal(await page.evaluate(xml => { try { window.exports.parseMoodleXML(xml); return false; } catch { return true; } }, invalid), true);
    }
  } finally { await browser.close(); }
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { File } = require('node:buffer');
const ts = require('typescript');
const { spawnSync } = require('node:child_process');
// Load this small, pure TS module graph without browser or application globals.
function load(relative) {
  const filename = path.resolve(__dirname, '../../', relative);
  const source = fs.readFileSync(filename, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  const resolve = name => name.startsWith('@/') ? load(`src/${name.slice(2)}.ts`) : require(name);
  new Function('require', 'module', 'exports', code)(resolve, mod, mod.exports);
  return mod.exports;
}
const importer = load('src/utils/labs/testcaseImport.ts');
const examples = load('src/constants/labs/authoringExamples.ts');
test('paired files retain spaces, CRLF and quoted CSV and reject incomplete/duplicate pairs', async () => {
  const files = [new File(['a\r\n b'], '10.in'), new File(['name,value\r\n"a,b",1\r\n'], '10.out')];
  const result = await importer.importTestcaseFiles(files);
  assert.equal(result[0].input, 'a\r\n b');
  assert.equal(result[0].expected, 'name,value\r\n"a,b",1\r\n');
  assert.equal(result[0].is_hidden, true);
  await assert.rejects(importer.importTestcaseFiles(files.slice(0, 1)), /Thiếu/);
  await assert.rejects(importer.importTestcaseFiles([...files, files[0]]), /trùng/);
});
test('JSON/JSONL import validates types, Unicode byte bounds and sample visibility', async () => {
  const result = await importer.importTestcaseFiles([new File(['{"input":"[1]","expected":"1","is_sample":true}\n'], 'tests.jsonl')]);
  assert.equal(result[0].is_hidden, false);
  assert.throws(() => importer.validateCaseDrafts([{ input: 'x', expected: 1 }]));
  assert.throws(() => importer.validateCaseDrafts([{ input: '😀'.repeat(5000), expected: '1' }]), /16 KiB/);
  assert.throws(() => importer.validateCaseDrafts(Array.from({ length: 51 }, () => ({ input: '', expected: '' }))));
});
test('provided nums problem oracle passes 21 and 63; seeded generator respects constraints', () => {
  const example = examples.specialElementsExample;
  for (const sample of example.test_cases) {
    const run = spawnSync('python3', ['-c', example.reference_code], { input: sample.input, encoding: 'utf8', timeout: 2000 });
    assert.equal(run.status, 0); assert.equal(run.stdout.trim(), sample.expected);
  }
  const seen = new Set();
  for (let index = 0; index < 50; index++) {
    const input = JSON.stringify({ seed: 42, index, count: 50 });
    const run = spawnSync('python3', ['-c', example.generator_code], { input, encoding: 'utf8', timeout: 2000 });
    assert.equal(run.status, 0);
    const nums = JSON.parse(run.stdout).nums;
    assert(nums.length >= 1 && nums.length <= 50); assert(nums.every(x => x >= 1 && x <= 50));
    assert(!seen.has(run.stdout)); seen.add(run.stdout);
    const output = spawnSync('python3', ['-c', example.reference_code], { input: run.stdout, encoding: 'utf8', timeout: 2000 });
    assert.equal(output.status, 0);
    const expected = nums.reduce((sum, x, i) => sum + (nums.length % (i + 1) === 0 ? x * x : 0), 0);
    assert.equal(Number(output.stdout), expected);
  }
});

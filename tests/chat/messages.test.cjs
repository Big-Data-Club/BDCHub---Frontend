const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../../src/utils/chat/messages.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
new Function('require', 'module', 'exports', code)(require, mod, mod.exports);
const { mergeMessages, chatWebSocketUrl } = mod.exports;
test('HTTP receipts and websocket replay reconcile once in server order', () => {
  const messages = mergeMessages([{ id: 3, body: 'before' }, { id: 1, body: 'first' }], [{ id: 3, body: 'edited' }, { id: 2, body: 'second' }]);
  assert.deepEqual(messages.map(m => m.id), [1, 2, 3]);
  assert.equal(messages[2].body, 'edited');
});
test('long histories retain a bounded latest window without mutating inputs', () => {
  const source = Array.from({ length: 700 }, (_, id) => ({ id: id + 1 }));
  const messages = mergeMessages(source, []);
  assert.equal(messages.length, 500); assert.equal(messages[0].id, 201); assert.equal(source.length, 700);
});
test('websocket endpoint uses deployment origin, TLS, and encoded credentials', () => {
  const local = new URL(chatWebSocketUrl('https://bdc.example', 'a&b?c'));
  assert.equal(local.protocol, 'wss:'); assert.equal(local.pathname, '/chatapiv1/chat/ws'); assert.equal(local.searchParams.get('token'), 'a&b?c');
  assert.equal(new URL(chatWebSocketUrl('http://localhost:3000', 't')).protocol, 'ws:');
  assert.equal(new URL(chatWebSocketUrl('https://bdc.example', 't', 'wss://chat.example/api/')).pathname, '/api/chat/ws');
});

import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { arch, platform } from 'node:os';

for (const file of ['Program.cs', 'SampleEndpoints.cs']) {
  assert(!readFileSync(file).includes(13), `${file} must use LF source line endings`);
}
const raw = readFileSync('artifacts/openapi/openapi.json', 'utf8');
const document = JSON.parse(raw);
const xml = document.paths['/xml'].get;
const literal = document.paths['/literal'].get;
const summary = 'First summary line.\nSecond summary line.';
const description = 'First description line.\nSecond description line.';
assert.equal(literal.summary, summary);
assert.equal(literal.description, description);
assert.equal(xml.summary.replaceAll('\r\n', '\n'), summary);
assert.equal(xml.description.replaceAll('\r\n', '\n'), description);
assert(!raw.includes('\r'), 'The JSON writer itself should use LF');
const report = {
  os: platform(),
  architecture: arch(),
  sourceLineEndings: 'LF',
  jsonFileLineEndings: 'LF',
  xmlSummary: xml.summary,
  xmlDescription: xml.description,
  literalSummary: literal.summary,
  literalDescription: literal.description,
  xmlDocumentationUsesLF: xml.summary === summary && xml.description === description,
};
const output = JSON.stringify(report, null, 2) + '\n';
writeFileSync('artifacts/result.json', output);
console.log(output);

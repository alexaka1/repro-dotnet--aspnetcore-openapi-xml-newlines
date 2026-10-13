import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const linux = readFileSync('artifacts/linux/openapi/openapi.json', 'utf8');
const windows = readFileSync('artifacts/windows/openapi/openapi.json', 'utf8');
const linuxReport = JSON.parse(readFileSync('artifacts/linux/result.json', 'utf8'));
const windowsReport = JSON.parse(readFileSync('artifacts/windows/result.json', 'utf8'));
console.log(`Linux XML summary: ${JSON.stringify(linuxReport.xmlSummary)}`);
console.log(`Windows XML summary: ${JSON.stringify(windowsReport.xmlSummary)}`);
console.log(`Documents byte-identical: ${linux === windows}`);
console.log(`Documents identical after replacing escaped CRLF with LF: ${linux === windows.replaceAll('\\r\\n', '\\n')}`);
assert.equal(linuxReport.xmlDocumentationUsesLF, true);
assert.equal(windowsReport.xmlDocumentationUsesLF, false);
assert.notEqual(linux, windows);
assert.equal(linux, windows.replaceAll('\\r\\n', '\\n'));
console.log('Reproduced: the same LF source generates different XML documentation strings on Linux and Windows.');

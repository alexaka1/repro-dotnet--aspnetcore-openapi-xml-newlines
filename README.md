# OpenAPI XML documentation uses the compiling OS's line endings

The same LF source files produce different OpenAPI summary and description
strings when compiled on Windows and Linux. This reproduces the real
`Microsoft.AspNetCore.OpenApi` XML-comment source generator; it does not simulate
Windows line endings.

## Requirements

- .NET SDK 10.0.401, selected by `global.json`
- Node.js, used only to inspect and compare the generated JSON

The project references `Microsoft.AspNetCore.OpenApi` and
`Microsoft.Extensions.ApiDescription.Server` 10.0.12. These are separate NuGet
packages. Record `dotnet --info` to identify the actual shared-framework runtime.
The verified Actions run did not log the Node.js version.

## Run

From a fresh checkout:

```shell
dotnet build --configuration Release --no-incremental
dotnet --info
node verify.mjs
```

The build writes `artifacts/openapi/openapi.json`; the verifier writes
`artifacts/result.json`. Both output directories are ignored by Git.

`/xml` gets its multiline summary and description from LF XML comments in
`SampleEndpoints.cs`. `/literal` supplies the same text with explicit LF through
`WithSummary` and `WithDescription`, as a control for JSON serialization.

Expected: XML-derived text uses consistent line endings on every OS, and the
documents have the same bytes on Windows and Linux. LF would match the literal
control and physical JSON file line endings.

Actual: the XML-derived text contains CRLF on Windows and LF on Linux and macOS.
The literal control and physical JSON file line endings remain LF on all three
platforms. A single Windows build shows escaped `\r\n` in the `xmlSummary` and
`xmlDescription` fields of `artifacts/result.json`, while the literal control
uses `\n`.

The verifier checks the LF source files, physical JSON line endings, literal
control, and XML text after newline normalization. It reports the actual XML
line endings without requiring them to match the host OS.

## Compare Windows and Linux

For a manual comparison, copy the complete generated `artifacts/` directory
from each machine into a third, clean checkout:

- Linux output goes in `artifacts/linux/`.
- Windows output goes in `artifacts/windows/`.

For example, the Linux files must be at `artifacts/linux/openapi/openapi.json`
and `artifacts/linux/result.json`, with matching Windows files under
`artifacts/windows/`. Run `node compare.mjs` from that checkout.

The GitHub Actions workflow runs the commands above in fresh Windows and Linux
checkouts, uploads the documents, reports and `dotnet --info`, then downloads
both artifacts and runs:

```shell
node compare.mjs
```

The expected reproduction output is:

```text
Linux XML summary: "First summary line.\nSecond summary line."
Windows XML summary: "First summary line.\r\nSecond summary line."
Documents byte-identical: false
Documents identical after replacing escaped CRLF with LF: true
Reproduced: the same LF source generates different XML documentation strings on Linux and Windows.
```

A green comparison job means the bug reproduced. It fails if the documents are
identical or if they differ in anything besides the escaped CRLF values.

## Source

The .NET 10.0.12 XML-comment generator calls
[`TrimEachLine`](https://github.com/dotnet/aspnetcore/blob/v10.0.12/src/OpenApi/gen/Helpers/StringExtensions.cs#L23-L89),
which reads the input lines and rebuilds them using `StringBuilder.AppendLine()`.
The helper therefore uses the compiling OS's newline, even for LF source files.

The runners build and generate the document on the same OS. The attribution to
the compiling OS comes from source inspection of the XML-comment generator.
The same helper remains on upstream `main` at
[commit `77e4202`](https://github.com/dotnet/aspnetcore/blob/77e4202bed594e8c1063e697b289221e57858bd5/src/OpenApi/gen/Helpers/StringExtensions.cs#L23-L89).
That commit was inspected without building it; executed evidence uses 10.0.12.

## Initial commit history

1. Unedited .NET SDK empty-web template output.
2. The minimal reproduction, inspection scripts and Windows/Linux workflow.

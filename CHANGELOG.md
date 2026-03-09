### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

#### [v1.3.0](https://github.com/carboneio/n8n-nodes-carbone/compare/v1.2.1...v1.3.0)

> 17 February 2026

##### Convert Document — new resource

- **Convert HTML to PDF** (`POST /render/template`): convert HTML documents to PDF using the Chromium rendering engine. Supports 4 input sources:
  - **URL** — fetch a webpage and convert it to PDF
  - **File** — use an HTML/XHTML file from a previous n8n node
  - **Template ID** — pick a static HTML template stored on Carbone (autocomplete picker)
  - **Raw HTML** — paste or map raw HTML code directly
- **Convert Office to PDF** (`POST /render/template`): convert Office documents (DOCX, XLSX, PPTX, ODT, ODS, ODP, ODG) to PDF. Supports 2 input sources:
  - **File** — use an Office document from a previous n8n node
  - **Template ID** — pick a static Office template stored on Carbone (autocomplete picker)
  - **Converter** option: choose between LibreOffice (default, best for ODT/ODS/ODP) and OnlyOffice (best for DOCX/XLSX/PPTX)

##### Template resource — new operations

- **Update template** (`PATCH /template/{id}`): update metadata of an existing template or version (name, comment, category, tags, deployedAt, expireAt) with a `resourceLocator` picker
- **List Categories** (`GET /templates/categories`): retrieve all template categories
- **List Tags** (`GET /templates/tags`): retrieve all template tags

##### Template resource — new fields on existing operations

- **Upload**: added `category`, `tags` (comma-separated, sent as array), and `expireAt` options
- **List**: added `origin` filter (`API` = 0, `Studio` = 1)

##### Render Document resource — new options

- **Converter**: select the PDF rendering engine (`L` LibreOffice, `O` OnlyOffice, `C` Chromium) with guidance on which engine suits each template format
- **Batch Split By**: JSON path to an array for batch document generation (e.g. `d.items`)
- **Batch Output**: output format for batch processing (`zip` or `pdf` merged)

##### Render Document resource — improved option descriptions

- All additional options (`timezone`, `lang`, `complement`, `variableStr`, `enum`, `translations`, `currencySource`, `currencyTarget`, `currencyRates`, `hardRefresh`, `reportName`) now have accurate descriptions sourced from the official Carbone API documentation

##### Template resource picker improvements

- **Search**: typing in the template picker now forwards the query to `GET /templates?search=` (server-side fuzzy/exact match on name, version ID, or template ID) instead of filtering locally
- **Value**: the picker now resolves to the **constant template ID** (`template.id`) instead of the version ID, with version ID as fallback — ensures `POST /render/{id}` always uses the same template ID regardless of versioning

##### Dynamic dropdowns for category and tags

- **Category** (Upload and Update): now a dynamic dropdown populated from `GET /templates/categories` — no need to type category names manually
- **Tags** (Upload and Update): now a dynamic multi-select dropdown populated from `GET /templates/tags` — supports selecting multiple tags with autocomplete
- **Add Version To** (Upload): standalone `resourceLocator` field — supports both "From List" picker and manual ID input, same as the Update operation

##### API spec compliance fixes

- `POST /template`: `template` file field is now appended **last** in the FormData, as required by the Carbone API specification
- `GET /templates/categories` and `GET /templates/tags`: response correctly parsed as `[{ name: string }]` objects (not strings)

##### Render Document — new features

- **Webhook URL** (additional option): enable asynchronous document generation (up to 5 minutes vs. 60 seconds synchronously). Sends the URL as a `carbone-webhook-url` header; Carbone POSTs a Render ID to the webhook on completion
- **Return Render ID** replaces the previous "Download" toggle: by default the file is always downloaded (`?download=true`); enable "Return Render ID" to receive a Render ID instead
- **Converter** field promoted from additional options collection to a standalone top-level field, shown only when "Convert To" is set to PDF
- Added **RTF**, **XLS**, **GIF**, **TIFF** to the "Convert To" dropdown
- Added **"Same as Template"** option (empty value, new default) to "Convert To" — no conversion applied unless explicitly selected

##### Render Document — UX improvements

- Renamed "Use Base64 Template On The Fly" → **"Use Inline Template File (Base64)"**
- Renamed "Report Name" → **"Document Name"**
- Renamed operation "Get Document" → **"Download Document"** with description differentiating title from purpose
- Improved descriptions for: `Data`, `Convert To`, `Document Name`, `Complement`, `Hard Refresh`, `Language`, `Timezone`, `Translations`, `Return Render ID`

##### Template resource — UX improvements

- **Delete Template**: upgraded to `resourceLocator` — now accepts both template IDs and version IDs
- **List Templates**: added dynamic **Category** dropdown populated from `GET /templates/categories`
- List response: `expireAt` timestamps now returned as ISO strings; `origin` values now returned as `"API"` or `"Studio"` instead of `0`/`1`

##### Binary output standardisation

- All binary outputs now use the standard `data` key (`$binary.data`) for full compatibility with downstream n8n nodes

##### Developer experience

- Added `npm run import-workflows` — imports all test workflows from the `test/` folder into the local n8n instance (`n8n import:workflow --separate --input=test/`)

##### Toolchain

- Updated `@n8n/node-cli` from `0.17.0` to `0.20.0`
- Enabled **cloud support** (`n8n-node cloud-support enable`) — node now passes strict mode lint and is eligible for n8n Cloud verification
- Updated `eslint-plugin-n8n-nodes-base` to `1.16.6`, `prettier` to `3.8.1`, `typescript` to `5.9.3`, `eslint` to `9.39.2`
- Removed explicit `@typescript-eslint` peer pins — now fully managed by `@n8n/node-cli`

#### [v1.2.1](https://github.com/carboneio/n8n-nodes-carbone/compare/v1.2.0...v1.2.1)

#### [v1.2.0](https://github.com/carboneio/n8n-nodes-carbone/compare/v1.1.0...v1.2.0)

- Add cli and fix [`#2`](https://github.com/carboneio/n8n-nodes-carbone/pull/2)
- Add ESLint Configuration for n8n Community Node and n8n-node cli [`5deb961`](https://github.com/carboneio/n8n-nodes-carbone/commit/5deb961429b8669898bac5631c6e1a7d1ca6791f)
- Remove gulp and icon build task [`c91504f`](https://github.com/carboneio/n8n-nodes-carbone/commit/c91504f52896af0679b5e4316428f527fe768c0e)
- Add n8n workflow test JSON [`183824a`](https://github.com/carboneio/n8n-nodes-carbone/commit/183824ad3dd5a49273858e94ba15c398f07a93ff)

#### [v1.1.0](https://github.com/carboneio/n8n-nodes-carbone/compare/v1.0.0...v1.1.0)

> 27 October 2025

- Update version and changelog [`9afcb2a`](https://github.com/carboneio/n8n-nodes-carbone/commit/9afcb2a1df243f355b88302c3d3da226dd264162)
- Merge pull request #1 from carboneio/publish-fix [`896a59f`](https://github.com/carboneio/n8n-nodes-carbone/commit/896a59ff7183a5e6aadc9214c19770186418153b)
- Use requestWithAuthentication and IExecuteFunctions [`e9ebf39`](https://github.com/carboneio/n8n-nodes-carbone/commit/e9ebf3993f73de76b738cbaff2ea75c76d3ff551)

#### v1.0.0

> 26 September 2025

- Update readme [`25e8722`](https://github.com/carboneio/n8n-nodes-carbone/commit/25e8722b7db96572149684a6a6c6e9b29159d274)
- v0 [`06f1d4f`](https://github.com/carboneio/n8n-nodes-carbone/commit/06f1d4f1c7f6884930d746d21bf2d0ac35b199ef)
- **Refactor Carbone node with modular resource operations** [`9115621`](https://github.com/carboneio/n8n-nodes-carbone/commit/9115621734bae95943c9af082c851bcfb69f5032)

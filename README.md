# n8n-nodes-carbone

An n8n community node to automate document generation and conversion using [Carbone.io](https://carbone.io/) — directly from your n8n workflows.

**What is Carbone.io?**
Carbone.io is a document generation API that merges JSON data into templates (DOCX, XLSX, PPTX, ODT, HTML, and more) to produce professional documents in any format — PDF, DOCX, XLSX, CSV, PNG, and beyond. It uses a simple `{d.variableName}` tag syntax inside your existing Office or LibreOffice templates, with no design constraints and no proprietary editor.

**What this node does**
- **Generate documents** — merge JSON data into a template and output a file in any supported format (PDF, DOCX, XLSX, ODT, PPTX, HTML, CSV, PNG, and more)
- **Convert documents to PDF** — convert HTML pages or Office files (DOCX, XLSX, PPTX, ODT…) to PDF using Chromium, LibreOffice, or OnlyOffice
- **Manage templates** — upload, update, delete, list, search, and download templates stored on Carbone.io; organize them with categories and tags
- **Asynchronous generation** — trigger document generation via webhook for large or complex documents (up to 5 minutes)
- **Batch generation** — generate one document per item in a JSON array, returned as a ZIP or merged PDF

**Common use cases**
- Invoices, quotes, and receipts from billing data
- Contracts and agreements populated with customer details
- Financial, sales, and operational reports with tables and charts
- Certificates of completion for training or events
- Shipping labels and packing slips
- Personalized letters and mass mail campaigns
- Any document that combines a fixed layout with dynamic data

**Supports Carbone API v4 and v5.**

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Convert Document

#### Convert HTML to PDF
Convert an HTML document to PDF using the Chromium rendering engine for high-fidelity output.

**HTML Source** (choose one):
- **URL**: The URL of the webpage to convert to PDF.
- **File**: Upload an HTML or XHTML file to convert to PDF. To inject dynamic data, use the action "Generate a Document" instead.
- **Template ID**: Pick a static HTML template stored on Carbone from the autocomplete list. To inject dynamic data using Carbone tags such as `{d.value}`, use the action "Generate a Document" instead.
- **Raw HTML**: Paste or map your raw HTML code directly. To inject dynamic data, use the action "Generate a Document" instead.

#### Convert Office to PDF
Convert an Office document (DOCX, XLSX, PPTX, ODT, ODS, ODP, ODG) to PDF.

**Office Source** (choose one):
- **File**: Upload an Office document to convert to PDF. Supported formats: DOCX, XLSX, PPTX, ODT, ODS, ODP, ODG. To inject dynamic data, use the action "Generate a Document" instead.
- **Template ID**: Pick a static Office template stored on Carbone from the autocomplete list. To inject dynamic data using Carbone tags such as `{d.value}`, use the action "Generate a Document" instead.

**Parameters:**
- **Converter**: PDF rendering engine — `LibreOffice` (default, best for ODT/ODS/ODP) or `OnlyOffice` (best for DOCX/XLSX/PPTX)

### Render Document

#### Generate Document
Generate a document by merging data into a template.

**Parameters:**
- **Use Inline Template File (Base64)**: Provide a template file directly as a base64-encoded string instead of selecting a stored template
- **Template ID**: The template ID to use (when not using inline template)
- **Template File (Base64)**: The template file encoded as base64 string (when using inline template)
- **Data**: Data merged into the template. Accessible via `{d.}` tags (e.g. `{d.firstName}`)
- **Convert To**: Convert the document into another format. Defaults to the template's native format. Supported: PDF, DOCX, XLSX, ODT, ODS, ODP, PPTX, PPT, DOC, CSV, HTML, XML, RTF, TXT, SVG, PNG, JPG, GIF, TIFF, WEBP, EPUB, IDML, Markdown, and more
- **Converter**: PDF rendering engine — shown only when "Convert To" is set to PDF. `LibreOffice` (default, best for ODT/ODS/ODP), `OnlyOffice` (best for DOCX/XLSX/PPTX), `Chromium` (best for HTML)
- **Return Render ID**: When enabled, returns a Render ID instead of the file. Use the Render ID with "Download Document" to retrieve the file. The document is available for one hour and can be downloaded once.

**Document Generation Additional Options:**
- **Batch Output**: Output format for batch processing — `zip` (individual files) or `pdf` (merged into one PDF)
- **Batch Split By**: JSON path to an array in your data for batch document generation (e.g. `d.items` generates one document per item)
- **Complement**: Extra data merged into the template, accessible via `{c.}` tags (e.g. `{c.companyName}`)
- **Currency Rates**: Exchange rate mappings for the `formatC` formatter
- **Currency Source**: Source currency code (e.g. `EUR`)
- **Currency Target**: Target currency code (e.g. `USD`)
- **Document Name**: Name of the generated document file. Supports Carbone template syntax (e.g. `invoice-{d.name}.pdf`)
- **Enum**: Enumeration lists for the `convEnum` formatter
- **Hard Refresh**: Refresh report content after rendering. Use only for Table of Contents numbering in DOCX/ODT documents
- **Language**: Locale of the generated document (e.g. `fr-FR`, `en-US`). Affects `formatN`, `formatD`, `formatI` formatters and `{t()}` translations
- **Timezone**: Convert document dates to a timezone (e.g. `Europe/Paris`). Affects `formatD` and `formatI` formatters
- **Translations**: Localization dictionary keyed by locale codes. All text in `{t()}` tags is replaced with the corresponding translation. Requires "Language" to be set
- **Variable String**: Predefined aliases using Carbone template syntax (e.g. `{#def = d.ID}`)
- **Webhook URL**: Enable asynchronous generation (up to 5 min). Carbone POSTs a Render ID to this URL when the document is ready. Use "Download Document" to retrieve it

#### Download Document
Download a document previously generated using its Render ID. Use this after a "Generate" with "Return Render ID" enabled or an asynchronous webhook generation.

**Parameters:**
- **Render ID**: The render ID of the generated document to retrieve

### Templates

#### List Templates
Retrieve a list of all templates from your Carbone.io account with optional filtering capabilities.

**Parameters:**
- **Template ID**: Filter by specific template ID
- **Version ID**: Filter by specific version ID
- **Category**: Filter by template category
- **Include Versions**: Include all versions for a specific template ID
- **Origin**: Filter by template origin — All, API (created via API), or Studio (created via Carbone Studio)
- **Search**: Search in template name (fuzzy search), version ID (exact) or template ID (exact)
- **Limit**: Maximum number of results to return (default: 50)
- **Cursor**: Cursor for pagination

#### List Categories
Retrieve all template categories available in your Carbone.io account.

#### List Tags
Retrieve all template tags available in your Carbone.io account.

#### Upload Template
Upload a new template file to Carbone.io or add a new version to an existing template.

**Parameters:**
- **Binary Property Name**: The name of the binary property that contains the template file
- **Add Version To**: Select an existing template to add a new version to (supports "From List" picker or manual ID input). Leave empty to create a new template.
- **Template Additional Options**:
  - **Category**: Dynamic dropdown populated from your Carbone.io categories (`GET /templates/categories`)
  - **Deployed At**: When a report is generated using the new template ID, Carbone selects the template version with the highest deployedAt timestamp that is not in the future
  - **Enable Versioning**: Whether to enable template versioning (default: true)
  - **Expire At**: Expiration date after which the template is no longer accessible
  - **Tags**: Dynamic multi-select dropdown populated from your Carbone.io tags (`GET /templates/tags`)
  - **Template Comment**: Comment for the template
  - **Template Name**: Name for the template

#### Update Template
Update the metadata of an existing template (name, comment, category, tags, deployedAt, expireAt) without re-uploading the file.

**Parameters:**
- **Template ID**: The unique identifier of the template to update (supports "From List" picker or manual ID input)
- **Update Fields**:
  - **Category**: Dynamic dropdown populated from your Carbone.io categories
  - **Comment**: New comment for the template
  - **Deployed At**: New deployment date
  - **Expire At**: New expiration date
  - **Name**: New name for the template
  - **Tags**: Dynamic multi-select dropdown populated from your Carbone.io tags

#### Delete Template
Delete a template from your Carbone.io account.

**Parameters:**
- **Template ID**: The unique identifier of the template to delete


## Credentials

To use the Carbone.io node, you need to authenticate with your Carbone.io account.

### Prerequisites
1. Sign up for a Carbone.io account at [carbone.io](https://carbone.io/)
2. Obtain your API key from your Carbone.io dashboard

### Authentication Setup
1. **API Key**: Your Carbone.io API key for authentication
2. **API URL**: The base URL for Carbone.io API (default: https://api.carbone.io)
   - Change this if you're using a self-hosted instance
3. **Carbone API Version**: The version of the Carbone API to use (4 or 5, default: 5)

The node uses Bearer token authentication with the Authorization header and includes the carbone-version header for API versioning.

## Development

### Import Test Workflows

Test workflows are stored in the `test/` folder. You can import them manually once your local n8n instance is running (`npm run dev`):

1. Open your n8n instance at `http://localhost:5678`
2. Go to **Workflows** → **Import from file**
3. Select the workflow JSON files from the `test/` folder

> Import each workflow once after cloning or when workflows are updated. n8n has no deduplication, so repeated imports will create duplicates.

## Compatibility

Tested with:
- n8n: `1.111.1`, `1.112.5`
- Carbone API: `v4`, `v5`
- NodeJS: `22.10.0`

## Usage

### Basic Template Upload
1. Add a Carbone node to your workflow
2. Select "Template" as resource and "Upload" as operation
3. Connect a node that provides the template file as binary data (e.g., Read Binary File node)
4. Configure the binary property name to match the output of the previous node
5. Optionally set template name and other metadata

### Basic Document Generation
1. Add a Carbone node to your workflow
2. Select "Render Document" as resource and "Generate" as operation
3. Choose between using a template ID or base64 template
4. Provide the JSON data to merge into the template
5. Select the desired output format
6. Choose whether to download the document directly or get a render ID

### Advanced Usage
- **Template Versioning**: Enable versioning to keep track of template changes
- **Localization**: Set language, timezone, and translations for multilingual documents
- **Currency Conversion**: Use currency rates and source/target currency for financial documents
- **Batch Generation**: Set `Batch Split By` to a JSON path (e.g. `d.orders`) to generate one document per item in the array, then collect results as a ZIP or merged PDF via `Batch Output`
- **PDF Engine Selection**: Use `Converter` to pick the rendering engine best suited for your template format (LibreOffice for ODT/ODS, OnlyOffice for DOCX/XLSX/PPTX, Chromium for HTML)


## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Carbone.io API Reference](https://carbone.io/api-reference.html)
* [Carbone.io Documentation](https://carbone.io/documentation.html)
* [Carbone.io Template Guide](https://carbone.io/documentation/design/overview/getting-started.html)

## Version history

### 1.3.0

**New: Convert Document resource**
- **Convert HTML to PDF**: convert from URL, file, Carbone template, or raw HTML using Chromium
- **Convert Office to PDF**: convert DOCX/XLSX/PPTX/ODT/ODS/ODP/ODG from file or Carbone template, with LibreOffice or OnlyOffice engine choice

**New: Template operations**
- **Update Template** (`PATCH /template/{id}`): update metadata without re-uploading the file
- **List Categories** (`GET /templates/categories`) and **List Tags** (`GET /templates/tags`)
- **Category** and **Tags** fields (Upload and Update) are now dynamic dropdowns populated live from the API
- **Add Version To** (Upload) is now a standalone resource picker supporting "From List" and manual ID input
- Added `category`, `tags`, and `expireAt` options to Upload Template
- Added `origin` filter to List Templates (API vs Studio)
- **Delete Template**: now accepts both template IDs and version IDs
- **List Templates**: added dynamic Category dropdown
- List response: `expireAt` returned as ISO string; `origin` returned as `"API"` or `"Studio"`

**New: Render Document options**
- **Webhook URL**: enable asynchronous generation (up to 5 min) — Carbone POSTs a Render ID to your URL when ready
- **Return Render ID**: replaces the previous "Download" toggle with clearer semantics — file downloaded by default, enable to get a Render ID instead
- **Converter** is now a standalone field shown only when "Convert To" is set to PDF
- Added RTF, XLS, GIF, TIFF to the "Convert To" dropdown
- Added "Same as Template" as the default option in "Convert To" — no conversion unless explicitly selected
- Added `converter`, `batchSplitBy`, and `batchOutput` options

**UX improvements**
- Renamed "Use Base64 Template On The Fly" → "Use Inline Template File (Base64)"
- Renamed "Report Name" → "Document Name"
- Renamed "Get Document" → "Download Document"
- Improved descriptions for all Render Document fields
- All binary outputs now use the standard `data` key (`$binary.data`)

**Other**
- Template picker search now queries the API server-side instead of filtering locally
- Template picker resolves to the constant template ID instead of the version ID
- Fixed `POST /template` FormData order: `template` file field sent last per API spec
- Updated `@n8n/node-cli` to `0.22.0`, enabled cloud support (`strict` mode)

### 1.2.1
- Removed the empty "Additional Options" collection from all action.

### 1.2.0
- Removed all `requestWithAuthentication` calls with `httpRequestWithAuthentication`.
- Using now n8n-node-cli to lint/build/release

### 1.1.0
- Removed redundant routing configurations from operation descriptions.
- Replaced all `helpers.request()` calls with `this.helpers.httpRequestWithAuthentication()`.
- Translate French error messages to English.


### 1.0.0
- Initial release.
- Template management operations: List, Upload, Delete.
- Document rendering operations: Generate, Get.
- Advanced options for document generation (localization, currency, etc.).
- Support for both template ID and base64 template approaches.

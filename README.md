# n8n-nodes-carbone

This is an n8n community node. It lets you use Carbone.io in your n8n workflows.

Carbone.io is a powerful document generation service that allows you to create professional PDF, DOCX, XLS, XLSX, ODT, PPTX, ODS, CSV and XML reports and documents from templates using JSON data. The easy-to-implement template concept frees you from design constraints, with a No/Low code approach.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Template Management

#### List Templates
Retrieve a list of all templates from your Carbone.io account with optional filtering capabilities.

**Parameters:**
- **Template ID**: Filter by specific template ID
- **Version ID**: Filter by specific version ID
- **Category**: Filter by template category
- **Include Versions**: Include all versions for a specific template ID
- **Search**: Search in template name (fuzzy search), version ID (exact) or template ID (exact)
- **Limit**: Maximum number of results to return (default: 50)
- **Cursor**: Cursor for pagination

#### Upload Template
Upload a new template file to Carbone.io or update an existing template.

**Parameters:**
- **Binary Property Name**: The name of the binary property that contains the template file
- **Template Additional Options**:
  - **Deployed At**: When a report is generated using the new template ID, Carbone selects the template version with the highest deployedAt timestamp that is not in the future
  - **Enable Versioning**: Whether to enable template versioning (default: true)
  - **Template Comment**: Comment for the template
  - **Template ID**: The unique identifier of the template to update
  - **Template Name**: Name for the template

#### Delete Template
Delete a template from your Carbone.io account.

**Parameters:**
- **Template ID**: The unique identifier of the template to delete

### Document Rendering

#### Generate Document
Generate a document from a template and JSON data.

**Parameters:**
- **Use Base64 Template On The Fly**: Whether to use a base64 template instead of a template ID
- **Template ID**: The template ID to use for generating the document (when not using base64 template)
- **Template File (Base64)**: The template file encoded as base64 string (when using base64 template)
- **Data**: JSON data-set to merge into the template
- **Convert To**: Optional: Convert the document to another format (PDF, DOCX, HTML, ODT)
- **Download Rendered Document**: Whether to download the rendered document directly or just get the render ID to fetch it later

**Document Generation Additional Options:**
- **Complement**: Additional data to complement the main dataset
- **Currency Rates**: Currency conversion rates
- **Currency Source**: The source currency for conversion
- **Currency Target**: The target currency for conversion
- **Enum**: Enumeration values for the template
- **Hard Refresh**: Whether to force a hard refresh of the template
- **Language**: The language to use for localization (default: fr)
- **Report Name**: The name of the generated report
- **Timezone**: The timezone to use for date formatting (default: Europe/Paris)
- **Translations**: Translation mappings for the template
- **Variable String**: A string containing variables to be processed

#### Get Document
Retrieve a generated document from render ID.

**Parameters:**
- **Render ID**: The render ID of the generated document to retrieve

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

## Compatibility

- **Tested with**: Latest stable versions of n8n

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


## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Carbone.io API Reference](https://carbone.io/api-reference.html)
* [Carbone.io Documentation](https://carbone.io/documentation.html)
* [Carbone.io Template Guide](https://carbone.io/documentation/design/overview/getting-started.html)

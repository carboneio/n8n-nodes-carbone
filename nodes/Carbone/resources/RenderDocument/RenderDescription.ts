import { INodeProperties } from 'n8n-workflow';

// Render Document Operations
export const renderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['renderDocument'],
			},
		},
		options: [
			{
				name: 'Generate',
				value: 'generate',
				action: 'Generate document',
				description: 'Generate a document by merging data into a template',
			},
			{
				name: 'Download Document',
				value: 'get',
				action: 'Download generated document',
				description: 'Download a document previously generated using its Render ID. Use this after a "Generate" with "Return Render ID" enabled or an asynchronous webhook generation.',
			},
		],
		default: 'generate',
	},
];

// Render Document Fields
export const generateOperation: INodeProperties[] = [
	{
		displayName: 'Template Source',
		name: 'templateSource',
		type: 'options',
		noDataExpression: true,
		default: 'templateId',
		description: 'Where the template comes from',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
			},
		},
		options: [
			{
				name: 'File',
				value: 'file',
				description: 'Use a template file from a previous node (DOCX, XLSX, PPTX, ODT, HTML…)',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide the template as a base64-encoded string',
			},
			{
				name: 'Template ID',
				value: 'templateId',
				description: 'Use a template stored on Carbone. Select from the list or enter an ID.',
			},
		],
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'resourceLocator',
		default: { mode: 'id', value: '' },
		required: true,
		description: 'The template ID to use for generating the document',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
				templateSource: ['templateId'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'templateSearch',
					searchable: true,
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. tmpl_123456789',
			},
		],
	},
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description:
			'The template file to use for document generation. Supported formats: DOCX, XLSX, PPTX, ODT, ODS, ODP, ODG, HTML.',
		hint: 'Enter the name of the binary field from the previous node (e.g. data, file, attachment_0)',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
				templateSource: ['file'],
			},
		},
	},
	{
		displayName: 'Template (Base64)',
		name: 'templateBase64',
		type: 'string',
		required: true,
		default: '',
		description: 'The template file encoded as a base64 string',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
				templateSource: ['base64'],
			},
		},
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'json',
		required: true,
		default: '{}',
		description: 'Data merged into the template to generate a document. Data is accessible in the template using {d.} (e.g. {d.firstName}).',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
			},
		},
	},
	{
		displayName: 'Convert To',
		name: 'convertTo',
		type: 'options',
		default: '',
		description: 'Convert the document into another format. Select "Same as Template" to keep the original format.',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
			},
		},
		options: [
			{
				name: 'CSV',
				value: 'csv',
			},
			{
				name: 'DOC',
				value: 'doc',
			},
			{
				name: 'DOCX',
				value: 'docx',
			},
			{
				name: 'EPUB',
				value: 'epub',
			},
			{
				name: 'GIF',
				value: 'gif',
			},
			{
				name: 'HTML',
				value: 'html',
			},
			{
				name: 'IDML',
				value: 'idml',
			},
			{
				name: 'JPG',
				value: 'jpg',
			},
			{
				name: 'Markdown (MD)',
				value: 'md',
			},
			{
				name: 'ODP',
				value: 'odp',
			},
			{
				name: 'ODS',
				value: 'ods',
			},
			{
				name: 'ODT',
				value: 'odt',
			},
			{
				name: 'PDF',
				value: 'pdf',
			},
			{
				name: 'PNG',
				value: 'png',
			},
			{
				name: 'PPT',
				value: 'ppt',
			},
			{
				name: 'PPTX',
				value: 'pptx',
			},
			{
				name: 'RTF',
				value: 'rtf',
			},
			{
				name: 'Same as Template',
				value: '',
			},
			{
				name: 'SVG',
				value: 'svg',
			},
			{
				name: 'TIFF',
				value: 'tiff',
			},
			{
				name: 'TXT',
				value: 'txt',
			},
			{
				name: 'WEBP',
				value: 'webp',
			},
			{
				name: 'XLS',
				value: 'xls',
			},
			{
				name: 'XLSX',
				value: 'xlsx',
			},
			{
				name: 'XML',
				value: 'xml',
			},
		],
	},
	{
		displayName: 'Converter',
		name: 'converter',
		type: 'options',
		default: 'L',
		description:
			'PDF rendering engine to use. Choose the engine best suited to your template format.',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
				convertTo: ['pdf'],
			},
		},
		options: [
			{
				name: 'LibreOffice (Default)',
				value: 'L',
				description:
					'Best balance between performance and compatibility. Recommended for ODT, ODS, ODP, and most open office formats.',
			},
			{
				name: 'OnlyOffice',
				value: 'O',
				description:
					'Ideal for Microsoft Office formats: DOCX, XLSX, PPTX. Provides better fidelity with Office-specific features.',
			},
			{
				name: 'Chromium',
				value: 'C',
				description:
					'High-fidelity HTML-to-PDF conversion. Use this for HTML or web-based templates.',
			},
		],
	},
	{
		displayName: 'Return Render ID',
		name: 'returnRenderId',
		type: 'boolean',
		default: false,
		description:
			'Whether to return a unique Render ID instead of the file itself',
		hint: 'If enabled, the node returns a Render ID instead of the file. Use the Render ID with the "Get Document" action to download the file. Note: the generated document is only available for one hour and can be downloaded once.',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
			},
		},
	},
];

export const getDocumentOperation: INodeProperties[] = [
	{
		displayName: 'Render ID',
		name: 'renderId',
		type: 'string',
		required: true,
		default: '',
		description: 'The render ID of the generated document to retrieve',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['get'],
			},
		},
	},
];

// Additional Options for Document Generation
export const generateAdditionalOptions: INodeProperties[] = [
	{
		displayName: 'Document Generation Additional Options',
		name: 'generateAdditionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
			},
		},
		options: [
			{
				displayName: 'Batch Output',
				name: 'batchOutput',
				type: 'options',
				default: 'zip',
				description:
					'Result format for batch processing. Requires "Batch Split By" to be set. "zip" compresses all reports into an archive; "pdf" concatenates all generated PDFs into a single file',
				options: [
					{
						name: 'ZIP',
						value: 'zip',
						description: 'Compress all generated documents into a ZIP archive (default)',
					},
					{
						name: 'PDF (Merged)',
						value: 'pdf',
						description: 'Concatenate all generated PDFs into a single PDF file',
					},
				],
			},
			{
				displayName: 'Batch Split By',
				name: 'batchSplitBy',
				type: 'string',
				default: '',
				placeholder: 'e.g. d.items',
				description:
					'JSON path to an array in the data object. When set, one document is generated per item in the array (batch processing).',
			},
			{
				displayName: 'Complement',
				name: 'complement',
				type: 'json',
				default: '{}',
				description:
					'Extra data merged into the template. Complement data is accessible in the template using {c.} (e.g. {c.companyName}).',
			},
				{
				displayName: 'Currency Rates',
				name: 'currencyRates',
				type: 'json',
				default: '{}',
				description:
					'Exchange rate mappings with the source currency as base (typically 1.0), used by the formatC formatter for currency conversions',
			},
			{
				displayName: 'Currency Source',
				name: 'currencySource',
				type: 'string',
				default: '',
				placeholder: 'e.g. EUR',
				description:
					'Source currency from the JSON data, used by the formatC formatter for currency conversions',
			},
			{
				displayName: 'Currency Target',
				name: 'currencyTarget',
				type: 'string',
				default: '',
				placeholder: 'e.g. USD',
				description:
					'Target currency for conversion when generating documents, used by the formatC formatter',
			},
			{
				displayName: 'Document Name',
				name: 'reportName',
				type: 'string',
				default: '',
				placeholder: 'e.g. "invoice-{d.name}-{d.date:formatD(YYYY-MM-DD)}"',
				description:
					'Name of the generated document file. Supports dynamic naming using Carbone template syntax (e.g. "invoice-{d.name}-{d.date:formatD(YYYY-MM-DD)}.pdf").',
			},
			{
				displayName: 'Enum',
				name: 'enum',
				type: 'json',
				default: '{}',
				description:
					'Enumeration lists for the convEnum formatter, mapping values to display names. Accepts either an array or an object format.',
			},
			{
				displayName: 'Hard Refresh',
				name: 'hardRefresh',
				type: 'boolean',
				default: false,
				description:
					'Whether to refresh the report content at the end of the rendering process. Use only for refreshing Table of Contents numbering in DOCX or ODT documents.',
			},
			{
				displayName: 'Language',
				name: 'lang',
				type: 'string',
				default: '',
				placeholder: 'e.g. fr-FR',
				description:
					'Locale of the generated document (e.g. "fr-FR", "en-US"). Affects number, date, and text formatters (formatN, formatD, formatI) and selects the correct translation when using {t()} tags.',
			},
			{
				displayName: 'Timezone',
				name: 'timezone',
				type: 'string',
				default: 'Europe/Paris',
				placeholder: 'e.g. America/New_York',
				description:
					'Convert document dates to a timezone (e.g. "Europe/Paris", "America/New_York"). Affects date formatters formatD and formatI.',
			},
			{
				displayName: 'Translations',
				name: 'translations',
				type: 'json',
				default: '{}',
				description:
					'Localization dictionary keyed by locale codes (e.g. "fr-ca", "es"). All text between {t()} tags is replaced with the corresponding translation. The "Language" field is required to select the correct translation.',
			},
			{
				displayName: 'Variable String',
				name: 'variableStr',
				type: 'string',
				default: '',
				placeholder: 'e.g. {#def = d.ID}',
				description:
					'Predefined aliases using Carbone template syntax (e.g. "{#def = d.ID}") for reusable variable definitions within templates',
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				placeholder: 'e.g. https://your-server.com/webhook',
				description:
					'Enable asynchronous document generation (up to 5 minutes, vs. 60 seconds synchronously). Carbone sends a POST request to this URL with a Render ID once the document is ready. Use the "Get Document" action to download it. Recommended for large or complex documents.',
			},
		],
	},
];

export const renderFields: INodeProperties[] = [
	...generateOperation,
	...generateAdditionalOptions,
	...getDocumentOperation,
];

// No need to re-export, they're already exported

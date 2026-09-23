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
				name: 'BMP',
				value: 'bmp',
			},
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
				name: 'ODG',
				value: 'odg',
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
				name: 'XHTML',
				value: 'xhtml',
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
				name: 'Carbone ICE (Fastest)',
				value: 'I',
				description:
					'The fastest PDF converter for DOCX and ODT templates: Carbone draws the PDF itself, with no office suite involved. Supports the Security and Watermark PDF options.',
			},
			{
				name: 'Chromium',
				value: 'C',
				description:
					'High-fidelity HTML-to-PDF conversion. Use this for HTML or web-based templates.',
			},
			{
				name: 'LibreOffice (Default)',
				value: 'L',
				description:
					'Best balance between performance and compatibility. Recommended for ODT, ODS, ODP, and most open office formats. Supports all the PDF format options.',
			},
			{
				name: 'OnlyOffice',
				value: 'O',
				description:
					'Ideal for Microsoft Office formats: XLSX, PPTX. For DOCX to PDF, Carbone ICE is recommended instead.',
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
		hint: 'If enabled, the node returns a Render ID instead of the file. Use the Render ID with the "Download Document" action to download the file. Note: the generated document is only available for one hour and can be downloaded once. If a "Webhook URL" is set in the options, the generation is asynchronous and the node returns JSON regardless of this toggle.',
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
				displayName: 'Batch Report Name',
				name: 'batchReportName',
				type: 'string',
				default: '',
				placeholder: 'e.g. report-{d.ID}',
				description: 'Name of each file inside the ZIP batch export. Supports Carbone tags using relative or absolute JSON paths (e.g. "report-{d.ID}"). Used together with "Batch Split By"; ignored when "Batch Output" is "pdf". An index is appended (report_1.pdf, report_2.pdf) as soon as two reports resolve to the same name.',
			},
			{
				displayName: 'Batch Split By',
				name: 'batchSplitBy',
				type: 'string',
				default: '',
				placeholder: 'e.g. d.items',
				description:
					'JSON path to an array in the data object ("d" when the data itself is an array, or "d.myArray" for a child array). When set, one document is generated per item in the array (batch processing, at most 100 items on Carbone Cloud). Requires the "Webhook URL" option (asynchronous mode).',
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
					'Static or dynamic name of the generated document, returned in the content-disposition header when the document is downloaded. The output extension is appended automatically, so do not include it. Supports Carbone tags (e.g. "invoice-{d.name}-{d.date:formatD(YYYY-MM-DD)}").',
			},
			{
				displayName: 'Egress Authorization Header',
				name: 'egressAuthorization',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				placeholder: 'e.g. Bearer my-token',
				description:
					'Value of the "authorization" header Carbone sends on all its outbound requests for this render: webhook calls, dynamic image URLs and files fetched by appendFile (max 511 characters). Use it when your images or files require authentication.',
			},
			{
				displayName: 'Enum',
				name: 'enum',
				type: 'json',
				default: '{}',
				description:
					'Enumerations for the convEnum formatter, as a JSON object mapping values to display names',
			},
			{
				displayName: 'Fail On',
				name: 'failOn',
				type: 'multiOptions',
				default: [],
				description:
					'Conditions that stop the render and return an error instead of generating a degraded document',
				options: [
					{
						name: 'Image URL Error',
						value: 'IMAGE_URL_ERROR',
						description:
							'An image that cannot be downloaded from its URL stops the report, instead of being replaced with the broken-image placeholder. Empty or undefined image values are skipped. Only images coming from a URL are concerned.',
					},
				],
			},
			{
				displayName: 'Hard Refresh',
				name: 'hardRefresh',
				type: 'boolean',
				default: false,
				description:
					'Whether to refresh the report content (pagination, table of contents) at the end of the rendering process. "Convert To" has to be defined to use this option.',
			},
			{
				displayName: 'Language',
				name: 'lang',
				type: 'string',
				default: '',
				placeholder: 'e.g. fr-FR',
				description:
					'Locale of the generated document (e.g. "fr-FR", "en-US"). Used by the number and currency formatters (formatN, formatC) and selects the correct translation when using {t()} tags.',
			},
			{
				displayName: 'Pre-Release Feature Level',
				name: 'preReleaseFeatureIn',
				type: 'number',
				default: 0,
				placeholder: 'e.g. 5000000',
				description:
					'Pre-release feature level for this render only (e.g. 5000000). Only features and fixes introduced up to the given tag are applied, higher tags stay disabled. It overrides the server default, and can itself be overridden by the tag set in the template.',
			},
			{
				displayName: 'Timezone',
				name: 'timezone',
				type: 'string',
				default: 'Europe/Paris',
				placeholder: 'e.g. America/New_York',
				description:
					'Convert document dates to a timezone (e.g. "Europe/Paris", "America/New_York"). The date must be chained with the formatD formatter in the template.',
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
				displayName: 'Webhook Authorization Header',
				name: 'webhookAuthorization',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				placeholder: 'e.g. Bearer my-token',
				description:
					'Value of the "authorization" header Carbone sends when calling your Webhook URL. Use it when your webhook endpoint requires authentication. Only used together with "Webhook URL".',
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				placeholder: 'e.g. https://your-server.com/webhook',
				description:
					'Enable asynchronous document generation: the rendering timeout is raised to 5 minutes. Carbone sends a POST request to this URL with a Render ID once the document is ready. Use the "Download Document" action to download it. Recommended for large or complex documents and required for batch processing.',
			},
		],
	},
];

// Format Options, sent as convertTo: { formatName, formatOptions } to the API
export const generateFormatOptions: INodeProperties[] = [
	{
		displayName: 'Format Options',
		name: 'formatOptions',
		type: 'collection',
		placeholder: 'Add Format Option',
		default: {},
		description:
			'Options applied to the output format (PDF security, watermarks, image and CSV settings)',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
				convertTo: ['pdf', 'jpg', 'png', 'csv'],
			},
		},
		options: [
			{
				displayName: 'Changes Allowed',
				name: 'Changes',
				type: 'options',
				default: 4,
				description: 'Changes allowed on the PDF when permissions are restricted',
				displayOptions: {
					show: { '/convertTo': ['pdf'] },
				},
				options: [
					{ name: 'None', value: 0 },
					{ name: 'Inserting, Deleting and Rotating Pages', value: 1 },
					{ name: 'Filling in Form Fields', value: 2 },
					{ name: 'Commenting, Filling in Form Fields', value: 3 },
					{ name: 'Any Except Extracting Pages (Default)', value: 4 },
				],
			},
			{
				displayName: 'Character Set',
				name: 'characterSet',
				type: 'string',
				default: '',
				placeholder: 'e.g. 76',
				description: 'Character set of the CSV output (e.g. "76" for UTF-8)',
				displayOptions: {
					show: { '/convertTo': ['csv'] },
				},
			},
			{
				displayName: 'Color Mode',
				name: 'ColorMode',
				type: 'options',
				default: 0,
				description: 'Color mode of the generated image',
				displayOptions: {
					show: { '/convertTo': ['jpg', 'png'] },
				},
				options: [
					{ name: 'Color', value: 0 },
					{ name: 'Greyscale', value: 1 },
				],
			},
			{
				displayName: 'Compression Level',
				name: 'Compression',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 9 },
				default: 6,
				description: 'PNG compression level, from 0 (no compression) to 9 (maximum)',
				displayOptions: {
					show: { '/convertTo': ['png'] },
				},
			},
			{
				displayName: 'Document Open Password',
				name: 'DocumentOpenPassword',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Password required to open the PDF. Used with "Encrypt File".',
				displayOptions: {
					show: { '/convertTo': ['pdf'] },
				},
			},
			{
				displayName: 'Enable Copying of Content',
				name: 'EnableCopyingOfContent',
				type: 'boolean',
				default: true,
				description: 'Whether the PDF content can be copied when permissions are restricted',
				displayOptions: {
					show: { '/convertTo': ['pdf'] },
				},
			},
			{
				displayName: 'Enable Text Access for Accessibility Tools',
				name: 'EnableTextAccessForAccessibilityTools',
				type: 'boolean',
				default: true,
				description:
					'Whether accessibility tools can read the PDF text when permissions are restricted',
				displayOptions: {
					show: { '/convertTo': ['pdf'] },
				},
			},
			{
				displayName: 'Encrypt File',
				name: 'EncryptFile',
				type: 'boolean',
				default: false,
				description:
					'Whether to encrypt the PDF (AES-256). The document properties (title, author, subject…) are encrypted as well. Set "Document Open Password" to require a password to open the file.',
				displayOptions: {
					show: { '/convertTo': ['pdf'] },
				},
			},
			{
				displayName: 'Field Separator',
				name: 'fieldSeparator',
				type: 'string',
				default: '',
				placeholder: 'e.g. ;',
				description: 'Field separator of the CSV output',
				displayOptions: {
					show: { '/convertTo': ['csv'] },
				},
			},
			{
				displayName: 'Interlaced',
				name: 'Interlaced',
				type: 'boolean',
				default: false,
				description: 'Whether the PNG is interlaced',
				displayOptions: {
					show: { '/convertTo': ['png'] },
				},
			},
			{
				displayName: 'Max Image Resolution',
				name: 'MaxImageResolution',
				type: 'options',
				default: 300,
				description:
					'Maximum resolution (DPI) of the images embedded in the PDF. Requires "Reduce Image Resolution". LibreOffice converter only.',
				displayOptions: {
					show: { '/convertTo': ['pdf'], '/converter': ['L'] },
				},
				options: [
					{ name: '75 DPI', value: 75 },
					{ name: '150 DPI', value: 150 },
					{ name: '300 DPI', value: 300 },
					{ name: '600 DPI', value: 600 },
					{ name: '1200 DPI', value: 1200 },
				],
			},
			{
				displayName: 'Page Range',
				name: 'PageRange',
				type: 'string',
				default: '',
				placeholder: 'e.g. 1-3',
				description: 'Range of pages exported to the PDF (e.g. "1-3"). LibreOffice converter only.',
				displayOptions: {
					show: { '/convertTo': ['pdf'], '/converter': ['L'] },
				},
			},
			{
				displayName: 'PDF Version',
				name: 'SelectPdfVersion',
				type: 'options',
				default: 0,
				description: 'PDF version or PDF/A compliance level. LibreOffice converter only.',
				displayOptions: {
					show: { '/convertTo': ['pdf'], '/converter': ['L'] },
				},
				options: [
					{ name: 'PDF 1.6 (Default)', value: 0 },
					{ name: 'PDF/A-1', value: 1 },
					{ name: 'PDF/A-2', value: 2 },
					{ name: 'PDF/A-3', value: 3 },
					{ name: 'PDF/A-4', value: 4 },
					{ name: 'PDF 1.5', value: 15 },
					{ name: 'PDF 1.6', value: 16 },
					{ name: 'PDF 1.7', value: 17 },
					{ name: 'PDF 2.0', value: 20 },
				],
			},
			{
				displayName: 'PDF/UA Compliance',
				name: 'PDFUACompliance',
				type: 'boolean',
				default: false,
				description:
					'Whether to generate a PDF/UA (Universal Accessibility) compliant document. LibreOffice converter only.',
				displayOptions: {
					show: { '/convertTo': ['pdf'], '/converter': ['L'] },
				},
			},
			{
				displayName: 'Permission Password',
				name: 'PermissionPassword',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description:
					'Password required to change the PDF permissions. Used with "Restrict Permissions".',
				displayOptions: {
					show: { '/convertTo': ['pdf'] },
				},
			},
			{
				displayName: 'Pixel Height',
				name: 'PixelHeight',
				type: 'number',
				default: 0,
				description: 'Height of the generated image in pixels (0 keeps the document size)',
				displayOptions: {
					show: { '/convertTo': ['jpg', 'png'] },
				},
			},
			{
				displayName: 'Pixel Width',
				name: 'PixelWidth',
				type: 'number',
				default: 0,
				description: 'Width of the generated image in pixels (0 keeps the document size)',
				displayOptions: {
					show: { '/convertTo': ['jpg', 'png'] },
				},
			},
			{
				displayName: 'Printing Allowed',
				name: 'Printing',
				type: 'options',
				default: 2,
				description: 'Printing quality allowed when the PDF permissions are restricted',
				displayOptions: {
					show: { '/convertTo': ['pdf'] },
				},
				options: [
					{ name: 'Not Permitted', value: 0 },
					{ name: 'Low Resolution (150 DPI)', value: 1 },
					{ name: 'Maximum Resolution (Default)', value: 2 },
				],
			},
			{
				displayName: 'Quality',
				name: 'Quality',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 100,
				description:
					'JPG quality from 1 to 100. For PDF output (LibreOffice only), sets the JPG compression of embedded images (default 90).',
				displayOptions: {
					show: { '/convertTo': ['jpg', 'pdf'] },
				},
			},
			{
				displayName: 'Reduce Image Resolution',
				name: 'ReduceImageResolution',
				type: 'boolean',
				default: false,
				description:
					'Whether to reduce the resolution of the images embedded in the PDF (see "Max Image Resolution"). LibreOffice converter only.',
				displayOptions: {
					show: { '/convertTo': ['pdf'], '/converter': ['L'] },
				},
			},
			{
				displayName: 'Restrict Permissions',
				name: 'RestrictPermissions',
				type: 'boolean',
				default: false,
				description:
					'Whether to restrict the PDF permissions (printing, changes, copying). Set "Permission Password" and the "Printing Allowed" / "Changes Allowed" options.',
				displayOptions: {
					show: { '/convertTo': ['pdf'] },
				},
			},
			{
				displayName: 'Text Delimiter',
				name: 'textDelimiter',
				type: 'string',
				default: '',
				placeholder: 'e.g. "',
				description: 'Text delimiter of the CSV output',
				displayOptions: {
					show: { '/convertTo': ['csv'] },
				},
			},
			{
				displayName: 'Translucent',
				name: 'Translucent',
				type: 'boolean',
				default: false,
				description: 'Whether the PNG background is translucent',
				displayOptions: {
					show: { '/convertTo': ['png'] },
				},
			},
			{
				displayName: 'Use Lossless Compression',
				name: 'UseLosslessCompression',
				type: 'boolean',
				default: true,
				description:
					'Whether to use lossless compression for the images embedded in the PDF. LibreOffice converter only.',
				displayOptions: {
					show: { '/convertTo': ['pdf'], '/converter': ['L'] },
				},
			},
			{
				displayName: 'Use Tagged PDF',
				name: 'UseTaggedPDF',
				type: 'boolean',
				default: false,
				description:
					'Whether to generate a tagged PDF (document structure for accessibility). LibreOffice converter only.',
				displayOptions: {
					show: { '/convertTo': ['pdf'], '/converter': ['L'] },
				},
			},
			{
				displayName: 'Watermarks',
				name: 'Watermarks',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				placeholder: 'Add Watermark',
				description:
					'Text watermarks added on the PDF (maximum 4). Supported by all converters. The text supports the {#PAGE_NUMBER} and {#PAGE_TOTAL} markers.',
				displayOptions: {
					show: { '/convertTo': ['pdf'] },
				},
				options: [
					{
						displayName: 'Watermark',
						name: 'watermarkValues',
						values: [
							{
								displayName: 'Anchor',
								name: 'anchor',
								type: 'options',
								default: 'center',
								description: 'Position of the watermark on the page',
								options: [
									{ name: 'Bottom', value: 'bottom' },
									{ name: 'Bottom Left', value: 'bottomLeft' },
									{ name: 'Bottom Right', value: 'bottomRight' },
									{ name: 'Center', value: 'center' },
									{ name: 'Left', value: 'left' },
									{ name: 'Right', value: 'right' },
									{ name: 'Top', value: 'top' },
									{ name: 'Top Left', value: 'topLeft' },
									{ name: 'Top Right', value: 'topRight' },
								],
							},
							{
								displayName: 'Color',
								name: 'color',
								type: 'color',
								default: '#000000',
								description: 'Color of the watermark text (#RGB or #RRGGBB)',
							},
							{
								displayName: 'Font',
								name: 'font',
								type: 'options',
								default: 'Helvetica',
								description: 'PDF base font of the watermark text',
								options: [
									{ name: 'Courier', value: 'Courier' },
									{ name: 'Courier Bold', value: 'Courier-Bold' },
									{ name: 'Courier Bold Oblique', value: 'Courier-BoldOblique' },
									{ name: 'Courier Oblique', value: 'Courier-Oblique' },
									{ name: 'Helvetica', value: 'Helvetica' },
									{ name: 'Helvetica Bold', value: 'Helvetica-Bold' },
									{ name: 'Helvetica Bold Oblique', value: 'Helvetica-BoldOblique' },
									{ name: 'Helvetica Oblique', value: 'Helvetica-Oblique' },
									{ name: 'Times Bold', value: 'Times-Bold' },
									{ name: 'Times Bold Italic', value: 'Times-BoldItalic' },
									{ name: 'Times Italic', value: 'Times-Italic' },
									{ name: 'Times Roman', value: 'Times-Roman' },
								],
							},
							{
								displayName: 'From Page',
								name: 'fromPage',
								type: 'number',
								typeOptions: { minValue: 1 },
								default: 1,
								description: 'First page on which the watermark is displayed',
							},
							{
								displayName: 'Offset X',
								name: 'offsetX',
								type: 'number',
								default: 0,
								description: 'Horizontal offset from the anchor, in points',
							},
							{
								displayName: 'Offset Y',
								name: 'offsetY',
								type: 'number',
								default: 0,
								description: 'Vertical offset from the anchor, in points',
							},
							{
								displayName: 'Opacity',
								name: 'opacity',
								type: 'number',
								typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
								default: 0.1,
								description:
									'Opacity of the watermark, from 0 to 1 (API default: 0.1 for the center anchor, 1 otherwise)',
							},
							{
								displayName: 'Rotation',
								name: 'rotation',
								type: 'number',
								typeOptions: { minValue: -360, maxValue: 360 },
								default: 45,
								description:
									'Rotation of the watermark in degrees (API default: 45 for the center anchor, 0 otherwise; non-center anchors only allow 0, 90 and -90)',
							},
							{
								displayName: 'Size',
								name: 'size',
								type: 'number',
								typeOptions: { minValue: 0, maxValue: 2000 },
								default: 0,
								description:
									'Font size of the watermark in points, from 1 to 2000. Leave 0 for automatic sizing (center anchor) or the API default (12).',
							},
							{
								displayName: 'Text',
								name: 'text',
								type: 'string',
								default: '',
								placeholder: 'e.g. CONFIDENTIAL - Page {#PAGE_NUMBER} of {#PAGE_TOTAL}',
								description: 'Text of the watermark (max 2000 characters)',
							},
							{
								displayName: 'To Page',
								name: 'toPage',
								type: 'number',
								typeOptions: { minValue: 0 },
								default: 0,
								description:
									'Last page on which the watermark is displayed. Leave 0 to display it until the last page.',
							},
						],
					},
				],
			},
		],
	},
];

export const renderFields: INodeProperties[] = [
	...generateOperation,
	...generateFormatOptions,
	...generateAdditionalOptions,
	...getDocumentOperation,
];

// No need to re-export, they're already exported

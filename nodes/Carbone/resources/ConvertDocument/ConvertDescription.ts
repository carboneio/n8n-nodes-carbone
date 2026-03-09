import { INodeProperties } from 'n8n-workflow';

// Convert Document Operations
export const convertOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['convertDocument'],
			},
		},
		options: [
			{
				name: 'Convert HTML to PDF',
				value: 'convertHtmlToPdf',
				action: 'Convert HTML to PDF',
				description:
					'Convert an HTML document to PDF using the Chromium rendering engine for high-fidelity output',
			},
			{
				name: 'Convert Office to PDF',
				value: 'convertOfficeToPdf',
				action: 'Convert office to pdf',
				description:
					'Convert an Office document (DOCX, XLSX, PPTX, ODT, ODS, ODP, ODG) to PDF',
			},
		],
		default: 'convertHtmlToPdf',
	},
];

// ─── Convert HTML to PDF Fields ─────────────────────────────────────────────

export const convertHtmlToPdfFields: INodeProperties[] = [
	{
		displayName: 'HTML Source',
		name: 'htmlSource',
		type: 'options',
		required: true,
		default: 'url',
		displayOptions: {
			show: {
				resource: ['convertDocument'],
				operation: ['convertHtmlToPdf'],
			},
		},
		options: [
			{
				name: 'File',
				value: 'file',
				description: 'Use an HTML file from a previous node',
			},
			{
				name: 'Raw HTML',
				value: 'rawHtml',
				description: 'Write or map raw HTML code directly',
			},
			{
				name: 'Template ID',
				value: 'templateId',
				description: 'Use an HTML template stored on Carbone',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Fetch HTML from a URL',
			},
		],
	},
	{
		displayName: 'URL',
		name: 'htmlUrl',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com/page.html',
		description: 'The URL of the webpage to convert to PDF',
		displayOptions: {
			show: {
				resource: ['convertDocument'],
				operation: ['convertHtmlToPdf'],
				htmlSource: ['url'],
			},
		},
	},
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description:
			'Upload an HTML or XHTML file to convert to PDF. To inject dynamic data, use the action "Generate a Document" instead.',
		hint: 'Enter the name of the binary field that holds the HTML file (e.g. data, file, attachment_0, etc.)',
		displayOptions: {
			show: {
				resource: ['convertDocument'],
				operation: ['convertHtmlToPdf'],
				htmlSource: ['file'],
			},
		},
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'resourceLocator',
		default: { mode: 'id', value: '' },
		required: true,
		description:
			'Converts a static HTML template to PDF. To inject dynamic data using Carbone tags such as {d.value} for text, barcodes, images, charts, translations, and more, use the action "Generate a Document ⚡️" instead.',
		displayOptions: {
			show: {
				resource: ['convertDocument'],
				operation: ['convertHtmlToPdf'],
				htmlSource: ['templateId'],
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
		displayName: 'HTML Content',
		name: 'rawHtml',
		type: 'string',
		required: true,
		default: '',
		typeOptions: {
			rows: 10,
		},
		description:
			'Paste or map your raw HTML code here. To inject dynamic data, use the action "Generate a Document" instead.',
		displayOptions: {
			show: {
				resource: ['convertDocument'],
				operation: ['convertHtmlToPdf'],
				htmlSource: ['rawHtml'],
			},
		},
	},
];

// ─── Convert Office to PDF Fields ───────────────────────────────────────────

export const convertOfficeToPdfFields: INodeProperties[] = [
	{
		displayName: 'Office Source',
		name: 'officeSource',
		type: 'options',
		required: true,
		default: 'file',
		displayOptions: {
			show: {
				resource: ['convertDocument'],
				operation: ['convertOfficeToPdf'],
			},
		},
		options: [
			{
				name: 'File',
				value: 'file',
				description: 'Use an Office document from a previous node',
			},
			{
				name: 'Template ID',
				value: 'templateId',
				description: 'Use an Office template stored on Carbone',
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
			'Upload an Office document to convert to PDF. Supported formats: DOCX, XLSX, PPTX, ODT, ODS, ODP, ODG. To inject dynamic data, use the action "Generate a Document" instead.',
		hint: 'Enter the name of the binary field that holds the Office file (e.g. data, file, attachment_0, etc.)',
		displayOptions: {
			show: {
				resource: ['convertDocument'],
				operation: ['convertOfficeToPdf'],
				officeSource: ['file'],
			},
		},
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'resourceLocator',
		default: { mode: 'id', value: '' },
		required: true,
		description:
			'Converts a static Office template to PDF. To inject dynamic data using Carbone tags such as {d.value} for text, barcodes, images, charts, translations, and more, use the action "Generate a Document ⚡️" instead.',
		displayOptions: {
			show: {
				resource: ['convertDocument'],
				operation: ['convertOfficeToPdf'],
				officeSource: ['templateId'],
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
		displayName: 'Converter',
		name: 'converter',
		type: 'options',
		default: 'L',
		description: 'PDF rendering engine to use for the conversion',
		displayOptions: {
			show: {
				resource: ['convertDocument'],
				operation: ['convertOfficeToPdf'],
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
		],
	},
];

export const convertFields: INodeProperties[] = [
	...convertHtmlToPdfFields,
	...convertOfficeToPdfFields,
];

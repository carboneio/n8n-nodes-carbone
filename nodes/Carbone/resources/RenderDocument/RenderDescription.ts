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
				description: 'Generate a document from a template and JSON data',
			},
			{
				name: 'Get Document',
				value: 'get',
				action: 'Get generated document',
				description: 'Get a generated document from render ID',
			},
		],
		default: 'generate',
	},
];

// Render Document Fields
export const generateOperation: INodeProperties[] = [
	{
		displayName: 'Use Base64 Template On The Fly',
		name: 'templateSource',
		type: 'boolean',
		default: false,
		description: 'Whether to use a base64 template instead of a template ID',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
			},
		},
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
				templateSource: [false],
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
		displayName: 'Template File (Base64)',
		name: 'templateBase64',
		type: 'string',
		required: true,
		default: '',
		description: 'The template file encoded as base64 string',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
				templateSource: [true],
			},
		},
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'json',
		required: true,
		default: '{}',
		description: 'JSON data-set to merge into the template',
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
		default: 'pdf',
		description: 'Optional: Convert the document to another format',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
			},
		},
		options: [
			{
				name: 'DOCX',
				value: 'docx',
			},
			{
				name: 'HTML',
				value: 'html',
			},
			{
				name: 'ODT',
				value: 'odt',
			},
			{
				name: 'PDF',
				value: 'pdf',
			},
		],
	},
	{
		displayName: 'Download Rendered Document',
		name: 'download',
		type: 'boolean',
		default: false,
		description:
			'Whether to download the rendered document directly or just get the render ID to fetch it later',
		hint: 'If set to true, the node will output the binary file. If false, it will output JSON with the render ID.',
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
				displayName: 'Complement',
				name: 'complement',
				type: 'json',
				default: '{}',
				description: 'Additional data to complement the main dataset',
			},
			{
				displayName: 'Currency Rates',
				name: 'currencyRates',
				type: 'json',
				default: '{}',
				description: 'Currency conversion rates',
			},
			{
				displayName: 'Currency Source',
				name: 'currencySource',
				type: 'string',
				default: '',
				description: 'The source currency for conversion',
			},
			{
				displayName: 'Currency Target',
				name: 'currencyTarget',
				type: 'string',
				default: '',
				description: 'The target currency for conversion',
			},
			{
				displayName: 'Enum',
				name: 'enum',
				type: 'json',
				default: '{}',
				description: 'Enumeration values for the template',
			},
			{
				displayName: 'Hard Refresh',
				name: 'hardRefresh',
				type: 'boolean',
				default: true,
				description: 'Whether to force a hard refresh of the template',
			},
			{
				displayName: 'Language',
				name: 'lang',
				type: 'string',
				default: 'fr',
				description: 'The language to use for localization',
			},
			{
				displayName: 'Report Name',
				name: 'reportName',
				type: 'string',
				default: 'document',
				description: 'The name of the generated report',
			},
			{
				displayName: 'Timezone',
				name: 'timezone',
				type: 'string',
				default: 'Europe/Paris',
				description: 'The timezone to use for date formatting',
			},
			{
				displayName: 'Translations',
				name: 'translations',
				type: 'json',
				default: '{}',
				description: 'Translation mappings for the template',
			},
			{
				displayName: 'Variable String',
				name: 'variableStr',
				type: 'string',
				default: '',
				description: 'A string containing variables to be processed',
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

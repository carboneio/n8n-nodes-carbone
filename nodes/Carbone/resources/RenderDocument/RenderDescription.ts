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
				routing: {
					request: {
						method: 'POST',
						url: '/render/{{$parameter.templateId}}',
					},
				},
			},
			{
				name: 'Get Document',
				value: 'get',
				action: 'Get generated document',
				description: 'Get a generated document from render ID',
				routing: {
					request: {
						method: 'GET',
						url: '/render/{{$parameter.renderId}}',
					},
				},
			},
		],
		default: 'generate',
	},
];

// Render Document Fields
export const generateOperation: INodeProperties[] = [
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		description: 'The template ID to use for generating the document',
		displayOptions: {
			show: {
				resource: ['renderDocument'],
				operation: ['generate'],
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
		routing: {
			request: {
				body: {
					data: '={{$value}}',
				},
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
				name: 'PDF',
				value: 'pdf',
			},
			{
				name: 'TXT',
				value: 'txt',
			},
			{
				name: 'XLSX',
				value: 'xlsx',
			},
		],
		routing: {
			request: {
				body: {
					convertTo: '={{$value}}',
				},
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

import { INodeProperties } from 'n8n-workflow';

// Resource unifiée
export const resource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Template',
				value: 'template',
			},
			{
				name: 'Render Document',
				value: 'renderDocument',
			},
		],
		default: 'template',
	},
];

// Template Operations
export const templateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['template'],
			},
		},
		options: [
			{
				name: 'Upload',
				value: 'upload',
				action: 'Upload template',
				description: 'Upload a template to Carbone.io',
				routing: {
					request: {
						method: 'POST',
						url: '/template',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete template',
				description: 'Delete a template from Carbone.io',
				routing: {
					request: {
						method: 'DELETE',
						url: '/template/{{$parameter.templateId}}',
					},
				},
			},
		],
		default: 'upload',
	},
];

// Template Fields
const uploadOperation: INodeProperties[] = [
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'The name of the binary property that contains the template file',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['upload'],
			},
		},
		hint: 'Enter the name of the binary field that holds the template file (e.g. data, file, attachment_0, etc.)',
	},
	{
		displayName: 'Enable Versioning',
		name: 'versioning',
		type: 'boolean',
		default: true,
		description: 'Whether to enable template versioning',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['upload'],
			},
		},
	},
	{
		displayName: 'Template Name',
		name: 'name',
		type: 'string',
		default: '',
		description: 'Name for the template',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['upload'],
			},
		},
	},
	{
		displayName: 'Template Comment',
		name: 'comment',
		type: 'string',
		default: '',
		description: 'Comment for the template',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['upload'],
			},
		},
	},
	{
		displayName: 'Deployed At',
		name: 'deployedAt',
		type: 'dateTime',
		default: '',
		description: 'When a report is generated using the new template ID, Carbone selects the template version with the highest deployedAt timestamp that is not in the future',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['upload'],
			},
		},
	},
];

const deleteOperation: INodeProperties[] = [
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the template to delete',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['delete'],
			},
		},
	},
];

export const templateFields: INodeProperties[] = [...uploadOperation, ...deleteOperation];

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
						url: '/render/{{$parameter.renderId}}',
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
const generateOperation: INodeProperties[] = [
	{
		displayName: 'Render ID',
		name: 'renderId',
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

const getDocumentOperation: INodeProperties[] = [
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

export const renderFields: INodeProperties[] = [...generateOperation, ...getDocumentOperation];

// Additional Options (masquées par défaut)
export const additionalOptions: INodeProperties[] = [
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Carbone Version',
				name: 'carboneVersion',
				type: 'string',
				default: '5',
				description: 'Version of the Carbone API to use for this operation (e.g., 4, 5, 6, etc.)',
				routing: {
					request: {
						headers: {
							'carbone-version': '={{$value}}',
						},
					},
				},
			},
		],
	},
];

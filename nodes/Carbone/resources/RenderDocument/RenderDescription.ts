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
export const generateOperation: INodeProperties[] = [
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

export const renderFields: INodeProperties[] = [...generateOperation, ...getDocumentOperation];

// No need to re-export, they're already exported

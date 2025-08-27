import { INodeProperties } from 'n8n-workflow';

// Resource: Template
export const templateResource: INodeProperties[] = [
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
		displayName: 'Template File',
		name: 'templateFile',
		type: 'string',
		required: true,
		default: '',
		description: 'The template file to upload (DOCX, ODT, XLSX, ODS, etc.)',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['upload'],
			},
		},
		routing: {
			request: {
				body: {
					template: '={{$value}}',
				},
			},
		},
	},
	{
		displayName: 'Payload',
		name: 'payload',
		type: 'string',
		default: '',
		description: 'Optional payload to generate a different template ID',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['upload'],
			},
		},
		routing: {
			request: {
				body: {
					payload: '={{$value}}',
				},
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

export const templateFields: INodeProperties[] = [
	...uploadOperation,
	...deleteOperation,
];

// Resource: Render Document
export const renderResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Render Document',
				value: 'renderDocument',
			},
		],
		default: 'renderDocument',
	},
];

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

export const renderFields: INodeProperties[] = [
	...generateOperation,
	...getDocumentOperation,
];

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
				type: 'options',
				default: '4',
				description: 'Version of the Carbone API to use for this operation',
				options: [
					{
						name: 'Version 4',
						value: '4',
					},
					{
						name: 'Version 5',
						value: '5',
					},
				],
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

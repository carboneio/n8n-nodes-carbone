import { INodeProperties } from 'n8n-workflow';

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
				name: 'List',
				value: 'list',
				action: 'List templates',
				description: 'List templates from Carbone.io',
				routing: {
					request: {
						method: 'GET',
						url: '/templates',
					},
				},
			},
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
export const uploadOperation: INodeProperties[] = [
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
];

export const deleteOperation: INodeProperties[] = [
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

export const listOperation: INodeProperties[] = [
	{
		displayName: 'Template ID',
		name: 'id',
		type: 'string',
		default: '',
		description: 'Filter by template ID',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['list'],
			},
		},
		routing: {
			request: {
				qs: {
					id: '={{$value}}',
				},
			},
		},
	},
	{
		displayName: 'Version ID',
		name: 'versionId',
		type: 'string',
		default: '',
		description: 'Filter by version ID',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['list'],
			},
		},
		routing: {
			request: {
				qs: {
					versionId: '={{$value}}',
				},
			},
		},
	},
	{
		displayName: 'Category',
		name: 'category',
		type: 'string',
		default: '',
		description: 'Filter by category',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['list'],
			},
		},
		routing: {
			request: {
				qs: {
					category: '={{$value}}',
				},
			},
		},
	},
	{
		displayName: 'Include Versions',
		name: 'includeVersions',
		type: 'boolean',
		default: false,
		description: 'Whether to include all versions for a specific template ID',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['list'],
			},
		},
		routing: {
			request: {
				qs: {
					includeVersions: '={{$value}}',
				},
			},
		},
	},
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		description:
			'Search in template name (fuzzy search), version ID (exact) or template ID (exact)',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['list'],
			},
		},
		routing: {
			request: {
				qs: {
					search: '={{$value}}',
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['list'],
			},
		},
		routing: {
			request: {
				qs: {
					limit: '={{$value}}',
				},
			},
		},
	},
	{
		displayName: 'Cursor',
		name: 'cursor',
		type: 'string',
		default: '',
		description: 'A cursor to use in pagination',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['list'],
			},
		},
		routing: {
			request: {
				qs: {
					cursor: '={{$value}}',
				},
			},
		},
	},
];

export const templateFields: INodeProperties[] = [
	...uploadOperation,
	...deleteOperation,
	...listOperation,
];

// Additional Options for Template Upload
export const templateUploadAdditionalOptions: INodeProperties[] = [
	{
		displayName: 'Template Additional Options',
		name: 'templateUploadAdditionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['upload'],
			},
		},
		options: [
			{
				displayName: 'Template Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name for the template',
			},
			{
				displayName: 'Template Comment',
				name: 'comment',
				type: 'string',
				default: '',
				description: 'Comment for the template',
			},
			{
				displayName: 'Deployed At',
				name: 'deployedAt',
				type: 'dateTime',
				default: '',
				description:
					'When a report is generated using the new template ID, Carbone selects the template version with the highest deployedAt timestamp that is not in the future',
			},
		],
	},
];

// No need to re-export, they're already exported

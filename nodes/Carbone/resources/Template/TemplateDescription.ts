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
				name: 'Delete',
				value: 'delete',
				action: 'Delete template',
				description: 'Delete a template from Carbone.io',
			},
			{
				name: 'Download',
				value: 'download',
				action: 'Download template',
				description: 'Download a template or a specific version from Carbone.io',
			},
			{
				name: 'List',
				value: 'list',
				action: 'List templates',
				description: 'List templates from Carbone.io',
			},
			{
				name: 'List Categories',
				value: 'listCategories',
				action: 'List template categories',
				description: 'List all template categories from Carbone.io',
			},
			{
				name: 'List Tags',
				value: 'listTags',
				action: 'List template tags',
				description: 'List all template tags from Carbone.io',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update template',
				description: 'Update the metadata of an existing template',
			},
			{
				name: 'Upload',
				value: 'upload',
				action: 'Upload template',
				description: 'Upload a template to Carbone.io',
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
];

export const deleteOperation: INodeProperties[] = [
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'resourceLocator',
		default: { mode: 'id', value: '' },
		required: true,
		description:
			'The template ID (deletes all versions) or a version ID (deletes that specific version)',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['delete'],
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
				placeholder: 'e.g. tmpl_123456789 or SHA256 version ID',
			},
		],
	},
];

export const updateOperation: INodeProperties[] = [
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'resourceLocator',
		default: { mode: 'id', value: '' },
		required: true,
		description: 'The ID of the template or version to update',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['update'],
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
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Comment',
				name: 'comment',
				type: 'string',
				default: '',
				description: 'Comment describing this version of the template',
			},
			{
				displayName: 'Deployed At',
				name: 'deployedAt',
				type: 'dateTime',
				default: '',
				description:
					'UTC timestamp for active version selection. Carbone selects the version with the highest deployedAt that is not in the future.',
			},
			{
				displayName: 'Expire At',
				name: 'expireAt',
				type: 'dateTime',
				default: '',
				description: 'UTC timestamp after which the template is automatically deleted',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the template',
			},
		],
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
	},
	{
		displayName: 'Origin',
		name: 'origin',
		type: 'options',
		default: '',
		description: 'Filter templates by their upload origin',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['list'],
			},
		},
		options: [
			{
				name: 'All',
				value: '',
				description: 'Return templates from all origins',
			},
			{
				name: 'API',
				value: 0,
				description: 'Templates uploaded via the API',
			},
			{
				name: 'Studio',
				value: 1,
				description: 'Templates uploaded via Carbone Studio',
			},
		],
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
	},
];

export const downloadOperation: INodeProperties[] = [
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'resourceLocator',
		default: { mode: 'id', value: '' },
		required: true,
		description: 'The ID of the template or version to download',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['download'],
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
];

export const templateFields: INodeProperties[] = [
	...uploadOperation,
	...deleteOperation,
	...downloadOperation,
	...updateOperation,
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
				displayName: 'Deployed At',
				name: 'deployedAt',
				type: 'dateTime',
				default: '',
				description:
					'UTC timestamp for active version selection. Carbone selects the version with the highest deployedAt that is not in the future.',
			},
			{
				displayName: 'Enable Versioning',
				name: 'versioning',
				type: 'boolean',
				default: true,
				description: 'Whether to enable template versioning',
			},
			{
				displayName: 'Expire At',
				name: 'expireAt',
				type: 'dateTime',
				default: '',
				description: 'UTC timestamp after which the template is automatically deleted',
			},
			{
				displayName: 'Template Comment',
				name: 'comment',
				type: 'string',
				default: '',
				description: 'Comment describing this version of the template',
			},
			{
				displayName: 'Template Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name for the template',
			},
		],
	},
];

export const uploadTemplateIdField: INodeProperties[] = [
	{
		displayName: 'Add Version To',
		name: 'uploadTemplateId',
		type: 'resourceLocator',
		default: { mode: 'id', value: '' },
		description:
			'Select an existing template to add a new version to. Leave empty to create a new template.',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['upload'],
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
];

export const uploadCategoryField: INodeProperties[] = [
	{
		displayName: 'Category Name or ID',
		name: 'category',
		type: 'options',
		default: '',
		description: 'Group the template into a category (similar to a folder). Choose from the list, or use an <a href="https://docs.n8n.io/data/expression-reference/">expression</a> to create a new one, e.g. <code>{{ "My New Category" }}</code>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['upload'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'loadCategories',
		},
	},
];

export const updateCategoryField: INodeProperties[] = [
	{
		displayName: 'Category Name or ID',
		name: 'category',
		type: 'options',
		default: '',
		description: 'Group the template into a category (similar to a folder). Choose from the list, or use an <a href="https://docs.n8n.io/data/expression-reference/">expression</a> to create a new one, e.g. <code>{{ "My New Category" }}</code>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['update'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'loadCategories',
		},
	},
];

export const listCategoryField: INodeProperties[] = [
	{
		displayName: 'Category Name or ID',
		name: 'category',
		type: 'options',
		default: '',
		description: 'Filter templates by category. Choose from the list, or use an <a href="https://docs.n8n.io/data/expression-reference/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['list'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'loadCategories',
		},
	},
];

export const uploadTagsField: INodeProperties[] = [
	{
		displayName: 'Tag Names or IDs',
		name: 'tags',
		type: 'multiOptions',
		default: [],
		description: 'Tags to assign to the template. Choose from the list, or use an <a href="https://docs.n8n.io/data/expression-reference/">expression</a> to set new or mixed tags, e.g. <code>{{ ["invoices", "2024"] }}</code>. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['upload'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'loadTags',
		},
	},
];

export const updateTagsField: INodeProperties[] = [
	{
		displayName: 'Tag Names or IDs',
		name: 'tags',
		type: 'multiOptions',
		default: [],
		description: 'Tags to assign to the template. Choose from the list, or use an <a href="https://docs.n8n.io/data/expression-reference/">expression</a> to set new or mixed tags, e.g. <code>{{ ["invoices", "2024"] }}</code>. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['update'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'loadTags',
		},
	},
];

import { INodeProperties } from 'n8n-workflow';
import { templateOperations, templateFields } from './resources/Template/TemplateDescription';
import { renderOperations, renderFields } from './resources/RenderDocument/RenderDescription';

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

// Re-export all the imported constants
export { templateOperations, templateFields, renderOperations, renderFields };

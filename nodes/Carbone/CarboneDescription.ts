import { INodeProperties } from 'n8n-workflow';
import {
	templateOperations,
	templateFields,
	templateUploadAdditionalOptions,
} from './resources/Template/TemplateDescription';
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

// Re-export all the imported constants
export {
	templateOperations,
	templateFields,
	templateUploadAdditionalOptions,
	renderOperations,
	renderFields,
};

import { INodeProperties } from 'n8n-workflow';
import {
	templateOperations,
	templateFields,
	templateUploadAdditionalOptions,
	uploadTemplateIdField,
	uploadCategoryField,
	updateCategoryField,
	listCategoryField,
	uploadTagsField,
	updateTagsField,
} from './resources/Template/TemplateDescription';
import { renderOperations, renderFields } from './resources/RenderDocument/RenderDescription';
import { convertOperations, convertFields } from './resources/ConvertDocument/ConvertDescription';

// Resource unifiée
export const resource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Convert Document',
				value: 'convertDocument',
			},
			{
				name: 'Render Document',
				value: 'renderDocument',
			},
			{
				name: 'Template',
				value: 'template',
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
	uploadTemplateIdField,
	uploadCategoryField,
	updateCategoryField,
	listCategoryField,
	uploadTagsField,
	updateTagsField,
	renderOperations,
	renderFields,
	convertOperations,
	convertFields,
};

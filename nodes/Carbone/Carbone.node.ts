import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeApiError,
	JsonObject,
} from 'n8n-workflow';
import {
	resource,
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
} from './CarboneDescription';
import { TemplateOperations } from './resources/Template/TemplateOperations';
import { RenderOperations } from './resources/RenderDocument/RenderOperations';
import { ConvertOperations } from './resources/ConvertDocument/ConvertOperations';
import { templateSearch } from './methods/templateSearch';
import { loadCategories } from './methods/loadCategories';
import { loadTags } from './methods/loadTags';

export class Carbone implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Carbone',
		name: 'carbone',
		icon: { light: 'file:carbone.svg', dark: 'file:carbone-dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Carbone.io API to manage templates and generate documents',
		defaults: {
			name: 'Carbone',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'carboneApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.apiUrl}}',
			url: '',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			// Resource unifiée
			...resource,
			...convertOperations,
			...templateOperations,
			...renderOperations,
			...convertFields,
			...templateFields,
			...uploadTemplateIdField,
			...uploadCategoryField,
			...updateCategoryField,
			...listCategoryField,
			...uploadTagsField,
			...updateTagsField,
			...renderFields,
			...templateUploadAdditionalOptions,
		],
	};

	methods = {
		listSearch: {
			templateSearch,
		},
		loadOptions: {
			loadCategories,
			loadTags,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Initialize operation handlers
		const templateOps = new TemplateOperations();
		const renderOps = new RenderOperations();
		const convertOps = new ConvertOperations();

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				let result: INodeExecutionData;

				if (resource === 'template') {
					if (operation === 'list') {
						result = await templateOps.listTemplates.call(this, i);
					} else if (operation === 'listCategories') {
						result = await templateOps.listCategories.call(this, i);
					} else if (operation === 'listTags') {
						result = await templateOps.listTags.call(this, i);
					} else if (operation === 'upload') {
						result = await templateOps.uploadTemplate.call(this, i);
					} else if (operation === 'update') {
						result = await templateOps.updateTemplate.call(this, i);
					} else if (operation === 'download') {
						result = await templateOps.downloadTemplate.call(this, i);
					} else if (operation === 'delete') {
						result = await templateOps.deleteTemplate.call(this, i);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Operation ${operation} on resource ${resource} is not implemented`,
						);
					}
				} else if (resource === 'convertDocument') {
					if (operation === 'convertHtmlToPdf') {
						result = await convertOps.convertHtmlToPdf.call(this, i);
					} else if (operation === 'convertOfficeToPdf') {
						result = await convertOps.convertOfficeToPdf.call(this, i);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Operation ${operation} on resource ${resource} is not implemented`,
						);
					}
				} else if (resource === 'renderDocument') {
					if (operation === 'generate') {
						// Render Generate Operation
						result = await renderOps.generateDocument.call(this, i);
					} else if (operation === 'get') {
						// Render Get Operation
						result = await renderOps.getDocument.call(this, i);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Operation ${operation} on resource ${resource} is not implemented`,
						);
					}
				} else {
					throw new NodeOperationError(this.getNode(), `Resource ${resource} is not implemented`);
				}

				returnData.push(result);
			} catch (error) {
				// Handle continueOnFail mode
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: {
							item: i,
							input: 0,
						},
					});
					continue;
				}

				// Re-throw already properly formatted errors
				if (error instanceof NodeOperationError || error instanceof NodeApiError) {
					throw error;
				}

				// Handle different types of errors appropriately
				if (error && typeof error === 'object' && 'httpCode' in error) {
					// This is an API error
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: 'API Error',
						description:
							(error as Error).message || 'An unexpected error occurred with the Carbone API.',
					});
				} else {
					// This is an operational error
					throw new NodeOperationError(
						this.getNode(),
						error instanceof Error ? error.message : String(error),
						{
							itemIndex: i,
						},
					);
				}
			}
		}

		return [returnData];
	}
}

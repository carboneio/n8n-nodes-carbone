import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
	NodeApiError,
} from 'n8n-workflow';
import {
	resource,
	templateOperations,
	templateFields,
	templateUploadAdditionalOptions,
	renderOperations,
	renderFields,
	additionalOptions,
} from './CarboneDescription';
import { TemplateOperations } from './resources/Template/TemplateOperations';
import { RenderOperations } from './resources/RenderDocument/RenderOperations';

export class Carbone implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Carbone',
		name: 'carbone',
		icon: { light: 'file:carbone.svg', dark: 'file:carbone.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Carbone.io API to manage templates and generate documents',
		defaults: {
			name: 'Carbone',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// Resource unifiée
			...resource,
			...templateOperations,
			...renderOperations,
			...templateFields,
			...renderFields,
			...templateUploadAdditionalOptions,

			// Additional Options (masquées par défaut)
			...additionalOptions,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Initialize operation handlers
		const templateOps = new TemplateOperations();
		const renderOps = new RenderOperations();

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				let result: INodeExecutionData;

				if (resource === 'template') {
					if (operation === 'list') {
						// Template List Operation
						result = await templateOps.listTemplates(
							i,
							this.helpers,
							this.getNodeParameter.bind(this),
							this.getCredentials.bind(this),
						);
					} else if (operation === 'upload') {
						// Template Upload Operation
						result = await templateOps.uploadTemplate(
							i,
							this.helpers,
							this.getNodeParameter.bind(this),
							this.getCredentials.bind(this),
							this.getInputData.bind(this),
						);
					} else if (operation === 'delete') {
						// Template Delete Operation
						result = await templateOps.deleteTemplate(
							i,
							this.helpers,
							this.getNodeParameter.bind(this),
							this.getCredentials.bind(this),
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`L'opération ${operation} sur la ressource ${resource} n'est pas implémentée`,
						);
					}
				} else if (resource === 'renderDocument') {
					if (operation === 'generate') {
						// Render Generate Operation
						result = await renderOps.generateDocument(
							i,
							this.helpers,
							this.getNodeParameter.bind(this),
							this.getCredentials.bind(this),
						);
					} else if (operation === 'get') {
						// Render Get Operation
						result = await renderOps.getDocument(
							i,
							this.helpers,
							this.getNodeParameter.bind(this),
							this.getCredentials.bind(this),
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`L'opération ${operation} sur la ressource ${resource} n'est pas implémentée`,
						);
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`La ressource ${resource} n'est pas implémentée`,
					);
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
					throw new NodeApiError(this.getNode(), error as any, {
						message: 'API Error',
						description: error.message || 'An unexpected error occurred with the Carbone API.',
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

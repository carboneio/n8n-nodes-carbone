import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import {
	resource,
	templateOperations,
	templateFields,
	renderOperations,
	renderFields,
	additionalOptions,
} from './CarboneDescription';

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

			// Additional Options (masquées par défaut)
			...additionalOptions,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Fonctions utilitaires locales
		const getCommonOptions = async (
			i: number,
		): Promise<{
			credentials: any;
			carboneVersion: string;
		}> => {
			const credentials = (await this.getCredentials('carboneApi')) as any;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;
			const carboneVersion = (additionalOptions.carboneVersion as string) || '5';

			return { credentials, carboneVersion };
		};

		const parseResponse = (response: any): any => {
			// Parser la réponse JSON si c'est une chaîne pour éviter le double encodage
			if (typeof response === 'string') {
				try {
					return JSON.parse(response);
				} catch (error) {
					// Si le parsing échoue, utiliser la réponse originale
					return response;
				}
			}
			return response;
		};

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				let result: INodeExecutionData;

				if (resource === 'template') {
					if (operation === 'list') {
						// Template List Operation
						const { credentials, carboneVersion } = await getCommonOptions(i);

						// Get all list parameters
						const id = this.getNodeParameter('id', i, '') as string;
						const versionId = this.getNodeParameter('versionId', i, '') as string;
						const category = this.getNodeParameter('category', i, '') as string;
						const includeVersions = this.getNodeParameter('includeVersions', i, false) as boolean;
						const search = this.getNodeParameter('search', i, '') as string;
						const limit = this.getNodeParameter('limit', i, 50) as number;
						const cursor = this.getNodeParameter('cursor', i, '') as string;

						// Build query parameters
						const qs: any = {};
						if (id) qs.id = id;
						if (versionId) qs.versionId = versionId;
						if (category) qs.category = category;
						if (includeVersions) qs.includeVersions = includeVersions;
						if (search) qs.search = search;
						if (limit) qs.limit = limit;
						if (cursor) qs.cursor = cursor;

						// Make the request to list templates
						const response = await this.helpers.request({
							method: 'GET',
							url: `${credentials.apiUrl}/templates`,
							headers: {
								Authorization: `Bearer ${credentials.apiKey}`,
								'carbone-version': carboneVersion,
							},
							qs: qs,
						});

						const parsedResponse = parseResponse(response);
						result = { json: parsedResponse };
					} else if (operation === 'upload') {
						// Template Upload Operation
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						const { credentials, carboneVersion } = await getCommonOptions(i);

						// Valider les données binaires
						this.helpers.assertBinaryData(i, binaryPropertyName);

						// Récupérer les informations du fichier binaire
						const binaryData = items[i].binary as any;
						const binaryProperty = binaryData[binaryPropertyName];

						if (!binaryProperty) {
							throw new NodeOperationError(
								this.getNode(),
								`Binary property '${binaryPropertyName}' not found`,
								{ itemIndex: i },
							);
						}

						const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
						const fileName = binaryProperty.fileName || 'template';

						// Get new parameters for template upload
						const versioning = this.getNodeParameter('versioning', i, true) as boolean;
						const name = this.getNodeParameter('name', i, '') as string;
						const comment = this.getNodeParameter('comment', i, '') as string;
						const deployedAt = this.getNodeParameter('deployedAt', i, '') as string;

						// Préparer le formulaire multipart
						// The 'versioning' field must be sent before the 'template' file field
						const formData: any = {};

						// Add versioning first as required by the API
						formData.versioning = versioning ? "true" : "false";

						// Add template file
						formData.template = {
							value: fileBuffer,
							options: {
								filename: fileName,
								contentType: 'application/octet-stream',
							},
						};

						// Add other parameters
						if (name) {
							formData.name = name;
						}
						if (comment) {
							formData.comment = comment;
						}
						if (deployedAt) {
							formData.deployedAt = deployedAt;
						}


						// Faire la requête d'upload
						const response = await this.helpers.request({
							method: 'POST',
							url: `${credentials.apiUrl}/template`,
							headers: {
								Authorization: `Bearer ${credentials.apiKey}`,
								'carbone-version': carboneVersion,
							},
							formData: formData,
						});

						const parsedResponse = parseResponse(response);
						result = { json: parsedResponse };
					} else if (operation === 'delete') {
						// Template Delete Operation
						const templateId = this.getNodeParameter('templateId', i) as string;
						const { credentials, carboneVersion } = await getCommonOptions(i);

						const response = await this.helpers.request({
							method: 'DELETE',
							url: `${credentials.apiUrl}/template/${templateId}`,
							headers: {
								Authorization: `Bearer ${credentials.apiKey}`,
								'carbone-version': carboneVersion,
							},
						});

						const parsedResponse = parseResponse(response);
						result = { json: parsedResponse };
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`L'opération ${operation} sur la ressource ${resource} n'est pas implémentée`,
						);
					}
				} else if (resource === 'renderDocument') {
					if (operation === 'generate') {
						// Render Generate Operation
						const renderId = this.getNodeParameter('renderId', i) as string;
						const data = this.getNodeParameter('data', i) as object;
						const convertTo = this.getNodeParameter('convertTo', i, 'pdf') as string;
						const { credentials, carboneVersion } = await getCommonOptions(i);

						const requestBody: any = { data };

						// Ajouter convertTo si spécifié
						if (convertTo && convertTo !== 'pdf') {
							requestBody.convertTo = convertTo;
						}

						const response = await this.helpers.request({
							method: 'POST',
							url: `${credentials.apiUrl}/render/${renderId}`,
							headers: {
								Authorization: `Bearer ${credentials.apiKey}`,
								'carbone-version': carboneVersion,
								'Content-Type': 'application/json',
							},
							body: requestBody,
							json: true,
						});

						const parsedResponse = parseResponse(response);
						result = { json: parsedResponse };
					} else if (operation === 'get') {
						// Render Get Operation - Version finale correcte
						const renderId = this.getNodeParameter('renderId', i) as string;
						const { credentials, carboneVersion } = await getCommonOptions(i);

						const response = await this.helpers.request({
							method: 'GET',
							url: `${credentials.apiUrl}/render/${renderId}`,
							headers: {
								Authorization: `Bearer ${credentials.apiKey}`,
								'carbone-version': carboneVersion,
							},
							encoding: null, // Important pour obtenir les données binaires
							resolveWithFullResponse: true,
						});

						// Extraire le nom du fichier depuis Content-Disposition
						const contentDisposition = response.headers['content-disposition'] || '';
						let fileName = 'document'; // fallback par défaut

						const filenameMatch = contentDisposition.match(
							/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
						);
						if (filenameMatch && filenameMatch[1]) {
							fileName = filenameMatch[1].replace(/['"]/g, '');
						}

						// Laisser n8n gérer le content-type automatiquement
						const binaryData = {
							[fileName]: await this.helpers.prepareBinaryData(response.body, fileName),
						};

						result = {
							json: {
								success: true,
								renderId,
								fileName,
								size: response.body.length,
							},
							binary: binaryData,
						};
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
				if (error instanceof NodeOperationError) {
					throw error;
				}
				throw new NodeOperationError(
					this.getNode(),
					`Erreur lors de l'exécution: ${error.message}`,
				);
			}
		}

		return [returnData];
	}
}

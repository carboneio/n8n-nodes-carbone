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
		const getCommonOptions = async (i: number): Promise<{
			credentials: any;
			carboneVersion: string;
		}> => {
			const credentials = (await this.getCredentials('carboneApi')) as any;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;
			const carboneVersion = (additionalOptions.carboneVersion as string) || '4';

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
					if (operation === 'upload') {
						// Template Upload Operation
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						const payload = this.getNodeParameter('payload', i) as string;
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
								{ itemIndex: i }
							);
						}

						const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
						const fileName = binaryProperty.fileName || 'template';

						// Préparer le formulaire multipart
						const formData: any = {
							template: {
								value: fileBuffer,
								options: {
									filename: fileName,
									contentType: 'application/octet-stream',
								},
							},
						};

						// Ajouter le payload si fourni
						if (payload) {
							formData.payload = {
								value: payload,
								options: {
									contentType: 'text/plain',
								},
							};
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
							`L'opération ${operation} sur la ressource ${resource} n'est pas implémentée`
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

						const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
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
							`L'opération ${operation} sur la ressource ${resource} n'est pas implémentée`
						);
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`La ressource ${resource} n'est pas implémentée`
					);
				}

				returnData.push(result);
			} catch (error) {
				if (error instanceof NodeOperationError) {
					throw error;
				}
				throw new NodeOperationError(this.getNode(), `Erreur lors de l'exécution: ${error.message}`);
			}
		}

		return [returnData];
	}
}

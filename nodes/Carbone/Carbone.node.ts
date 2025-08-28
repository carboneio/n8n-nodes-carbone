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

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			if (resource === 'template' && operation === 'upload') {
				// Gérer l'upload binaire
				const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
				const payload = this.getNodeParameter('payload', i) as string;

				// Valider les données binaires
				this.helpers.assertBinaryData(i, binaryPropertyName);

				// Récupérer les informations du fichier binaire
				const item = items[i];
				const binaryData = item.binary as any;
				const binaryProperty = binaryData[binaryPropertyName];

				if (!binaryProperty) {
					throw new NodeOperationError(
						this.getNode(),
						`Binary property '${binaryPropertyName}' not found`,
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

				// Récupérer la version Carbone depuis les additionalOptions
				const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;
				const carboneVersion = (additionalOptions.carboneVersion as string) || '4';

				// Obtenir les credentials
				const credentials = (await this.getCredentials('carboneApi')) as any;

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

				// Parser la réponse JSON si c'est une chaîne pour éviter le double encodage
				let parsedResponse;
				if (typeof response === 'string') {
					try {
						parsedResponse = JSON.parse(response);
					} catch (error) {
						// Si le parsing échoue, utiliser la réponse originale
						parsedResponse = response;
					}
				} else {
					parsedResponse = response;
				}

				returnData.push({ json: parsedResponse });
			}
		}

		return [returnData];
	}
}

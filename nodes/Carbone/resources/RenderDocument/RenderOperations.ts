import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { CarboneErrorHandler } from '../../utils/errorHandler';

export class RenderOperations {
	private static parseResponse(response: any): any {
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
	}

	async generateDocument(
		this: IExecuteFunctions,
		i: number,
	): Promise<INodeExecutionData> {
		const templateSource = this.getNodeParameter('templateSource', i) as boolean;
		let templateId: string | undefined;
		let templateBase64: string | undefined;

		if (!templateSource) {
			templateId = this.getNodeParameter('templateId', i, undefined, {
				extractValue: true,
			}) as string;
		} else {
			templateBase64 = this.getNodeParameter('templateBase64', i) as string;
		}
		let data = this.getNodeParameter('data', i);
		const convertTo = this.getNodeParameter('convertTo', i, 'pdf') as string;
		const download = this.getNodeParameter('download', i, false) as boolean;
		const additionalOptions = this.getNodeParameter('generateAdditionalOptions', i, {}) as any;

		const credentials = (await this.getCredentials('carboneApi')) as any;

		// Gérer le parsing JSON pour les deux formats: string et objet
		if (typeof data === 'string') {
			try {
				data = JSON.parse(data);
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid JSON data: ${error.message}`,
					{
						description: 'The data parameter must be valid JSON. Please check your JSON syntax.',
						itemIndex: i,
					},
				);
			}
		}

		const requestBody: any = { data };

		// Ajouter convertTo si spécifié
		if (convertTo) {
			requestBody.convertTo = convertTo;
		}

		// Ajouter les options supplémentaires
		if (additionalOptions) {
			if (additionalOptions.timezone) requestBody.timezone = additionalOptions.timezone;
			if (additionalOptions.lang) requestBody.lang = additionalOptions.lang;
			if (additionalOptions.complement) requestBody.complement = additionalOptions.complement;
			if (additionalOptions.variableStr) requestBody.variableStr = additionalOptions.variableStr;
			if (additionalOptions.reportName) requestBody.reportName = additionalOptions.reportName;
			if (additionalOptions.enum) requestBody.enum = additionalOptions.enum;
			if (additionalOptions.translations) requestBody.translations = additionalOptions.translations;
			if (additionalOptions.currencySource)
				requestBody.currencySource = additionalOptions.currencySource;
			if (additionalOptions.currencyTarget)
				requestBody.currencyTarget = additionalOptions.currencyTarget;
			if (additionalOptions.currencyRates)
				requestBody.currencyRates = additionalOptions.currencyRates;
			if (additionalOptions.hardRefresh) requestBody.hardRefresh = additionalOptions.hardRefresh;
		}

		// Construire l'URL en fonction de la source du template
		let apiUrl: string;
		if (templateSource) {
			// Ajouter le template base64 au corps de la requête
			requestBody.template = templateBase64;
			apiUrl = `${credentials.apiUrl}/render/template`;
		} else {
			// Utiliser le template ID dans l'URL
			apiUrl = `${credentials.apiUrl}/render/${templateId}`;
		}

		try {
			const response = await this.helpers.requestWithAuthentication.call(
				this,
				'carboneApi',
				{
					method: 'POST',
					url: apiUrl,
					qs: {
						download: download ? 'true' : undefined,
					},
					headers: {
						'Content-Type': 'application/json',
					},
					body: requestBody,
					encoding: download ? null : undefined,
					resolveWithFullResponse: download,
				},
			);

			if (download) {
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

				return {
					json: {
						success: true,
						fileName,
						size: response.body.length,
					},
					binary: binaryData,
					pairedItem: {
						item: i,
						input: 0,
					},
				};
			} else {
				return {
					json: RenderOperations.parseResponse(response),
					pairedItem: {
						item: i,
						input: 0,
					},
				};
			}
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, this.getNode());
		}
	}

	async getDocument(
		this: IExecuteFunctions,
		i: number,
	): Promise<INodeExecutionData> {
		const renderId = this.getNodeParameter('renderId', i) as string;
		const credentials = (await this.getCredentials('carboneApi')) as any;

		try {
			const response = await this.helpers.requestWithAuthentication.call(
				this,
				'carboneApi',
				{
					method: 'GET',
					url: `${credentials.apiUrl}/render/${renderId}`,
					encoding: null, // Important pour obtenir les données binaires
					resolveWithFullResponse: true,
				},
			);

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

			return {
				json: {
					success: true,
					renderId,
					fileName,
					size: response.body.length,
				},
				binary: binaryData,
				pairedItem: {
					item: i,
					input: 0,
				},
			};
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, this.getNode());
		}
	}
}

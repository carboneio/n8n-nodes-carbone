import { INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { CarboneErrorHandler } from '../../utils/errorHandler';

export class RenderOperations {
	async generateDocument(
		i: number,
		helpers: any,
		getNodeParameter: any,
		getCredentials: any,
	): Promise<INodeExecutionData> {
		const templateId = getNodeParameter('templateId', i) as string;
		let data = getNodeParameter('data', i);
		const convertTo = getNodeParameter('convertTo', i, 'pdf') as string;
		const download = getNodeParameter('download', i, false) as boolean;
		const additionalOptions = getNodeParameter('generateAdditionalOptions', i, {}) as any;

		const credentials = (await getCredentials('carboneApi')) as any;

		// Gérer le parsing JSON pour les deux formats: string et objet
		if (typeof data === 'string') {
			try {
				data = JSON.parse(data);
			} catch (error) {
				throw new NodeOperationError(
					{ name: 'Carbone' } as any,
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

		try {
			const response = await helpers.request({
				method: 'POST',
				url: `${credentials.apiUrl}/render/${templateId}`,
				qs: {
					download: download ? 'true' : undefined,
				},
				headers: {
					Authorization: `Bearer ${credentials.apiKey}`,
					'carbone-version': credentials.carboneVersion,
					'Content-Type': 'application/json',
				},
				body: requestBody,
				json: !download,
				encoding: download ? null : undefined,
				resolveWithFullResponse: download,
			});

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
					[fileName]: await helpers.prepareBinaryData(response.body, fileName),
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
					json: this.parseResponse(response),
					pairedItem: {
						item: i,
						input: 0,
					},
				};
			}
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, { name: 'Carbone' } as any);
		}
	}

	async getDocument(
		i: number,
		helpers: any,
		getNodeParameter: any,
		getCredentials: any,
	): Promise<INodeExecutionData> {
		const renderId = getNodeParameter('renderId', i) as string;
		const credentials = (await getCredentials('carboneApi')) as any;

		try {
			const response = await helpers.request({
				method: 'GET',
				url: `${credentials.apiUrl}/render/${renderId}`,
				headers: {
					Authorization: `Bearer ${credentials.apiKey}`,
					'carbone-version': credentials.carboneVersion,
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
				[fileName]: await helpers.prepareBinaryData(response.body, fileName),
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
			throw CarboneErrorHandler.handleApiError(error, { name: 'Carbone' } as any);
		}
	}

	private parseResponse(response: any): any {
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
}

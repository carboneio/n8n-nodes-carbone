import { IExecuteFunctions, INodeExecutionData, NodeOperationError, IDataObject } from 'n8n-workflow';
import { CarboneErrorHandler } from '../../utils/errorHandler';

interface CarboneCredentials {
	apiKey: string;
	apiUrl: string;
	carboneVersion: string;
}

interface GenerateOptions {
	timezone?: string;
	lang?: string;
	complement?: unknown;
	variableStr?: string;
	reportName?: string;
	enum?: unknown;
	translations?: unknown;
	currencySource?: string;
	currencyTarget?: string;
	currencyRates?: unknown;
	hardRefresh?: boolean;
}

export class RenderOperations {
	private static parseResponse(response: unknown): unknown {
		// Parser la réponse JSON si c'est une chaîne pour éviter le double encodage
		if (typeof response === 'string') {
			try {
				return JSON.parse(response);
			} catch {
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
		const additionalOptions = this.getNodeParameter('generateAdditionalOptions', i, {}) as GenerateOptions;

		const credentials = (await this.getCredentials('carboneApi')) as CarboneCredentials;

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

		const requestBody: Record<string, unknown> = { data };

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
			if (download) {
				// Pour le téléchargement, utiliser returnFullResponse: true
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'carboneApi',
					{
						method: 'POST',
						url: apiUrl,
						qs: {
							download: 'true',
						},
						headers: {
							'Content-Type': 'application/json',
						},
						body: requestBody,
						returnFullResponse: true,
						encoding: 'arraybuffer',
					},
				);

				// Extraire le nom du fichier depuis Content-Disposition
				const contentDisposition = (response.headers as IDataObject)['content-disposition'] as string || '';
				let fileName = 'document'; // fallback par défaut

				const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
				if (filenameMatch && filenameMatch[1]) {
					fileName = filenameMatch[1].replace(/['"]/g, '');
				}

				// Laisser n8n gérer le content-type automatiquement
				const buffer = response.body as ArrayBuffer;
				const binaryData = {
					[fileName]: await this.helpers.prepareBinaryData(buffer, fileName),
				};

				return {
					json: {
						success: true,
						fileName,
						size: (response.body as ArrayBuffer).byteLength,
					},
					binary: binaryData,
					pairedItem: {
						item: i,
						input: 0,
					},
				};
			} else {
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'carboneApi',
					{
						method: 'POST',
						url: apiUrl,
						headers: {
							'Content-Type': 'application/json',
						},
						body: requestBody,
					},
				);

				return {
					json: RenderOperations.parseResponse(response) as IDataObject,
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
		const credentials = (await this.getCredentials('carboneApi')) as CarboneCredentials;

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'carboneApi',
				{
					method: 'GET',
					url: `${credentials.apiUrl}/render/${renderId}`,
					returnFullResponse: true,
					encoding: 'arraybuffer',
				},
			);

			// Extraire le nom du fichier depuis Content-Disposition
			const contentDisposition = (response.headers as IDataObject)['content-disposition'] as string || '';
			let fileName = 'document'; // fallback par défaut

			const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
			if (filenameMatch && filenameMatch[1]) {
				fileName = filenameMatch[1].replace(/['"]/g, '');
			}

			// Laisser n8n gérer le content-type automatiquement
			const buffer = response.body as ArrayBuffer;
			const binaryData = {
				[fileName]: await this.helpers.prepareBinaryData(buffer, fileName),
			};

			return {
				json: {
					success: true,
					renderId,
					fileName,
					size: (response.body as ArrayBuffer).byteLength,
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

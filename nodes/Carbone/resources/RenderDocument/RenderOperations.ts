import { INodeExecutionData } from 'n8n-workflow';

export class RenderOperations {
	async generateDocument(
		i: number,
		helpers: any,
		getNodeParameter: any,
		getCredentials: any,
	): Promise<INodeExecutionData> {
		const renderId = getNodeParameter('renderId', i) as string;
		const data = getNodeParameter('data', i) as object;
		const convertTo = getNodeParameter('convertTo', i, 'pdf') as string;
		const credentials = (await getCredentials('carboneApi')) as any;

		const requestBody: any = { data };

		// Ajouter convertTo si spécifié
		if (convertTo && convertTo !== 'pdf') {
			requestBody.convertTo = convertTo;
		}

		const response = await helpers.request({
			method: 'POST',
			url: `${credentials.apiUrl}/render/${renderId}`,
			headers: {
				Authorization: `Bearer ${credentials.apiKey}`,
				'carbone-version': credentials.carboneVersion,
				'Content-Type': 'application/json',
			},
			body: requestBody,
			json: true,
		});

		return { json: this.parseResponse(response) };
	}

	async getDocument(
		i: number,
		helpers: any,
		getNodeParameter: any,
		getCredentials: any,
	): Promise<INodeExecutionData> {
		const renderId = getNodeParameter('renderId', i) as string;
		const credentials = (await getCredentials('carboneApi')) as any;

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

		const filenameMatch = contentDisposition.match(
			/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
		);
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
		};
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

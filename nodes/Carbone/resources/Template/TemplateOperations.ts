import { INodeExecutionData } from 'n8n-workflow';

export class TemplateOperations {
	async listTemplates(
		i: number,
		helpers: any,
		getNodeParameter: any,
		getCredentials: any,
	): Promise<INodeExecutionData> {
		const credentials = (await getCredentials('carboneApi')) as any;

		// Get all list parameters
		const id = getNodeParameter('id', i, '') as string;
		const versionId = getNodeParameter('versionId', i, '') as string;
		const category = getNodeParameter('category', i, '') as string;
		const includeVersions = getNodeParameter('includeVersions', i, false) as boolean;
		const search = getNodeParameter('search', i, '') as string;
		const limit = getNodeParameter('limit', i, 50) as number;
		const cursor = getNodeParameter('cursor', i, '') as string;

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
		const response = await helpers.request({
			method: 'GET',
			url: `${credentials.apiUrl}/templates`,
			headers: {
				Authorization: `Bearer ${credentials.apiKey}`,
				'carbone-version': credentials.carboneVersion,
			},
			qs: qs,
		});

		return { json: this.parseResponse(response) };
	}

	async uploadTemplate(
		i: number,
		helpers: any,
		getNodeParameter: any,
		getCredentials: any,
		getInputData: any,
	): Promise<INodeExecutionData> {
		const binaryPropertyName = getNodeParameter('binaryPropertyName', i) as string;
		const credentials = (await getCredentials('carboneApi')) as any;

		// Valider les données binaires
		helpers.assertBinaryData(i, binaryPropertyName);

		// Récupérer les informations du fichier binaire
		const binaryData = getInputData()[i].binary as any;
		const binaryProperty = binaryData[binaryPropertyName];

		if (!binaryProperty) {
			// Let the caller handle the error
			throw new Error(`Binary property '${binaryPropertyName}' not found`);
		}

		const fileBuffer = await helpers.getBinaryDataBuffer(i, binaryPropertyName);
		const fileName = binaryProperty.fileName || 'template';

		// Get new parameters for template upload
		const versioning = getNodeParameter('versioning', i, true) as boolean;
		const id = getNodeParameter('id', i, '') as string;
		const name = getNodeParameter('name', i, '') as string;
		const comment = getNodeParameter('comment', i, '') as string;
		const deployedAt = getNodeParameter('deployedAt', i, '') as string;

		// Préparer le formulaire multipart
		// The 'versioning' field must be sent before the 'template' file field
		const formData: any = {};

		// Add versioning first as required by the API
		formData.versioning = versioning ? 'true' : 'false';

		// Add template file
		formData.template = {
			value: fileBuffer,
			options: {
				filename: fileName,
				contentType: 'application/octet-stream',
			},
		};

		// Add other parameters
		if (id) {
			formData.id = id;
		}
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
		const response = await helpers.request({
			method: 'POST',
			url: `${credentials.apiUrl}/template`,
			headers: {
				Authorization: `Bearer ${credentials.apiKey}`,
				'carbone-version': credentials.carboneVersion,
			},
			formData: formData,
		});

		return { json: this.parseResponse(response) };
	}

	async deleteTemplate(
		i: number,
		helpers: any,
		getNodeParameter: any,
		getCredentials: any,
	): Promise<INodeExecutionData> {
		const templateId = getNodeParameter('templateId', i) as string;
		const credentials = (await getCredentials('carboneApi')) as any;

		const response = await helpers.request({
			method: 'DELETE',
			url: `${credentials.apiUrl}/template/${templateId}`,
			headers: {
				Authorization: `Bearer ${credentials.apiKey}`,
				'carbone-version': credentials.carboneVersion,
			},
		});

		return { json: this.parseResponse(response) };
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

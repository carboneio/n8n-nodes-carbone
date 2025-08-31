import { INodeExecutionData } from 'n8n-workflow';

export class TemplateOperations {
	private convertIsoToUnixTimestamp(isoString: string): string {
		return Math.floor(new Date(isoString).getTime() / 1000).toString();
	}

	private convertUnixTimestampToIso(timestamp: number): string | null {
		if (timestamp === 0) {
			return null;
		}
		return new Date(timestamp * 1000).toISOString();
	}

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

		return {
			json: this.parseResponse(response),
			pairedItem: {
				item: i,
				input: 0,
			},
		};
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

		// Get additional options for template upload
		const templateUploadAdditionalOptions = getNodeParameter(
			'templateUploadAdditionalOptions',
			i,
			{},
		) as any;
		const versioning =
			templateUploadAdditionalOptions.versioning !== undefined
				? templateUploadAdditionalOptions.versioning
				: true;
		const id = templateUploadAdditionalOptions.id || '';
		const name = templateUploadAdditionalOptions.name || '';
		const comment = templateUploadAdditionalOptions.comment || '';
		const deployedAt = templateUploadAdditionalOptions.deployedAt || '';

		// Préparer le formulaire multipart
		// The 'versioning' field must be sent before the 'template' file field
		// The 'id' field must be sent before the 'template' file field if provided
		const formData: any = {};

		// Add versioning first as required by the API
		formData.versioning = versioning ? 'true' : 'false';

		// Add id if not empty (must be sent before the template field)
		if (id) {
			formData.id = id;
		}

		// Add template file
		formData.template = {
			value: fileBuffer,
			options: {
				filename: fileName,
				contentType: 'application/octet-stream',
			},
		};

		// Add other optional parameters (only if not empty)
		if (name) {
			formData.name = name;
		}
		if (comment) {
			formData.comment = comment;
		}
		if (deployedAt) {
			// Convert ISO string to Unix timestamp if needed
			if (
				typeof deployedAt === 'string' &&
				/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(deployedAt)
			) {
				formData.deployedAt = this.convertIsoToUnixTimestamp(deployedAt);
			} else {
				formData.deployedAt = deployedAt;
			}
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

		return {
			json: this.parseResponse(response),
			pairedItem: {
				item: i,
				input: 0,
			},
		};
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

		return {
			json: this.parseResponse(response),
			pairedItem: {
				item: i,
				input: 0,
			},
		};
	}

	private parseResponse(response: any): any {
		// Parser la réponse JSON si c'est une chaîne pour éviter le double encodage
		if (typeof response === 'string') {
			try {
				response = JSON.parse(response);
			} catch (error) {
				// Si le parsing échoue, utiliser la réponse originale
				return response;
			}
		}

		// Si la réponse contient un tableau de données, convertir les timestamps en dates ISO
		if (response && response.data && Array.isArray(response.data)) {
			response.data = response.data.map((item: any) => {
				if (item.deployedAt !== undefined) {
					item.deployedAt = this.convertUnixTimestampToIso(item.deployedAt);
				}
				if (item.createdAt !== undefined) {
					item.createdAt = this.convertUnixTimestampToIso(item.createdAt);
				}
				return item;
			});
		}

		return response;
	}
}

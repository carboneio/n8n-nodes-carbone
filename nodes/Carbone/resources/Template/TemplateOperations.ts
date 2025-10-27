import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { CarboneErrorHandler } from '../../utils/errorHandler';

export class TemplateOperations {
	private static convertIsoToUnixTimestamp(isoString: string): string {
		return Math.floor(new Date(isoString).getTime() / 1000).toString();
	}

	private static convertUnixTimestampToIso(timestamp: number): string | null {
		if (timestamp === 0) {
			return null;
		}
		return new Date(timestamp * 1000).toISOString();
	}

	private static parseResponse(response: any): any {
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
					item.deployedAt = TemplateOperations.convertUnixTimestampToIso(item.deployedAt);
				}
				if (item.createdAt !== undefined) {
					item.createdAt = TemplateOperations.convertUnixTimestampToIso(item.createdAt);
				}
				return item;
			});
		}

		return response;
	}

	async listTemplates(
		this: IExecuteFunctions,
		i: number,
	): Promise<INodeExecutionData> {
		const credentials = (await this.getCredentials('carboneApi')) as any;

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

		try {
			// Make the request to list templates using modern authentication helper
			const response = await this.helpers.requestWithAuthentication.call(
				this,
				'carboneApi',
				{
					method: 'GET',
					url: `${credentials.apiUrl}/templates`,
					qs: qs,
				},
			);

			return {
				json: TemplateOperations.parseResponse(response),
				pairedItem: {
					item: i,
					input: 0,
				},
			};
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, this.getNode());
		}
	}

	async uploadTemplate(
		this: IExecuteFunctions,
		i: number,
	): Promise<INodeExecutionData> {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
		const credentials = (await this.getCredentials('carboneApi')) as any;

		// Valider les données binaires
		this.helpers.assertBinaryData(i, binaryPropertyName);

		// Récupérer les informations du fichier binaire
		const binaryData = this.getInputData()[i].binary as any;
		const binaryProperty = binaryData[binaryPropertyName];

		if (!binaryProperty) {
			throw new NodeOperationError(
				this.getNode(),
				`Binary property '${binaryPropertyName}' not found`,
				{
					description: 'Please ensure the binary data is properly configured in the previous node',
					itemIndex: i,
				},
			);
		}

		const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
		const fileName = binaryProperty.fileName || 'template';

		// Get additional options for template upload
		const templateUploadAdditionalOptions = this.getNodeParameter(
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
				formData.deployedAt = TemplateOperations.convertIsoToUnixTimestamp(deployedAt);
			} else {
				formData.deployedAt = deployedAt;
			}
		}

		try {
			// Faire la requête d'upload using modern authentication helper
			const response = await this.helpers.requestWithAuthentication.call(
				this,
				'carboneApi',
				{
					method: 'POST',
					url: `${credentials.apiUrl}/template`,
					formData: formData,
				},
			);

			return {
				json: TemplateOperations.parseResponse(response),
				pairedItem: {
					item: i,
					input: 0,
				},
			};
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, this.getNode());
		}
	}

	async deleteTemplate(
		this: IExecuteFunctions,
		i: number,
	): Promise<INodeExecutionData> {
		const templateId = this.getNodeParameter('templateId', i) as string;
		const credentials = (await this.getCredentials('carboneApi')) as any;

		try {
			const response = await this.helpers.requestWithAuthentication.call(
				this,
				'carboneApi',
				{
					method: 'DELETE',
					url: `${credentials.apiUrl}/template/${templateId}`,
				},
			);

			return {
				json: TemplateOperations.parseResponse(response),
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

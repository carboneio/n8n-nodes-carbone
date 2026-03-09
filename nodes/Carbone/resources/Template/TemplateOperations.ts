import {
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
	IDataObject,
} from 'n8n-workflow';
import { CarboneErrorHandler } from '../../utils/errorHandler';


interface CarboneCredentials {
	apiKey: string;
	apiUrl: string;
	carboneVersion: string;
}

interface TemplateUploadOptions {
	versioning?: boolean;
	name?: string;
	comment?: string;
	expireAt?: string;
	deployedAt?: string;
}

interface TemplateUpdateFields {
	name?: string;
	comment?: string;
	expireAt?: string;
	deployedAt?: string;
}

interface TemplateItem {
	deployedAt?: number | string;
	createdAt?: number | string;
	expireAt?: number | string;
	origin?: number | string;
	[key: string]: unknown;
}

interface TemplateResponse {
	data?: TemplateItem[];
	[key: string]: unknown;
}

export class TemplateOperations {
	private static convertIsoToUnixTimestamp(isoString: string): string {
		return Math.floor(new Date(isoString).getTime() / 1000).toString();
	}

	private static convertUnixTimestampToIso(timestamp: number): string | undefined {
		if (timestamp === 0) {
			return undefined;
		}
		return new Date(timestamp * 1000).toISOString();
	}

	private static parseResponse(response: unknown): unknown {
		// Parser la réponse JSON si c'est une chaîne pour éviter le double encodage
		let parsedResponse: unknown = response;
		if (typeof response === 'string') {
			try {
				parsedResponse = JSON.parse(response);
			} catch {
				// Si le parsing échoue, utiliser la réponse originale
				return response;
			}
		}

		// Si la réponse contient un tableau de données, convertir les timestamps en dates ISO
		if (parsedResponse && typeof parsedResponse === 'object' && 'data' in parsedResponse) {
			const templateResponse = parsedResponse as TemplateResponse;
			if (Array.isArray(templateResponse.data)) {
				templateResponse.data = templateResponse.data.map((item: TemplateItem) => {
					if (item.deployedAt !== undefined && typeof item.deployedAt === 'number') {
						item.deployedAt = TemplateOperations.convertUnixTimestampToIso(item.deployedAt);
					}
					if (item.createdAt !== undefined && typeof item.createdAt === 'number') {
						item.createdAt = TemplateOperations.convertUnixTimestampToIso(item.createdAt);
					}
					if (item.expireAt !== undefined && typeof item.expireAt === 'number') {
						item.expireAt = TemplateOperations.convertUnixTimestampToIso(item.expireAt);
					}
					if (item.origin === 0) {
						item.origin = 'API';
					} else if (item.origin === 1) {
						item.origin = 'Studio';
					}
					return item;
				});
				return templateResponse;
			}
		}

		return parsedResponse;
	}

	async listCategories(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
		const credentials = (await this.getCredentials('carboneApi')) as CarboneCredentials;

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'carboneApi', {
				method: 'GET',
				url: `${credentials.apiUrl}/templates/categories`,
			});

			return {
				json: TemplateOperations.parseResponse(response) as IDataObject,
				pairedItem: { item: i, input: 0 },
			};
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, this.getNode());
		}
	}

	async listTags(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
		const credentials = (await this.getCredentials('carboneApi')) as CarboneCredentials;

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'carboneApi', {
				method: 'GET',
				url: `${credentials.apiUrl}/templates/tags`,
			});

			return {
				json: TemplateOperations.parseResponse(response) as IDataObject,
				pairedItem: { item: i, input: 0 },
			};
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, this.getNode());
		}
	}

	async updateTemplate(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
		const templateId = this.getNodeParameter('templateId', i, undefined, {
			extractValue: true,
		}) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as TemplateUpdateFields;
		const credentials = (await this.getCredentials('carboneApi')) as CarboneCredentials;

		const body: Record<string, unknown> = {};
		if (updateFields.name) body.name = updateFields.name;
		if (updateFields.comment) body.comment = updateFields.comment;
		const category = this.getNodeParameter('category', i, '') as string;
		if (category) body.category = category;
		const tags = this.getNodeParameter('tags', i, []) as string[];
		if (tags.length > 0) {
			body.tags = tags;
		}
		if (updateFields.deployedAt) {
			body.deployedAt = TemplateOperations.convertIsoToUnixTimestamp(updateFields.deployedAt);
		}
		if (updateFields.expireAt) {
			body.expireAt = TemplateOperations.convertIsoToUnixTimestamp(updateFields.expireAt);
		}

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'carboneApi', {
				method: 'PATCH',
				url: `${credentials.apiUrl}/template/${templateId}`,
				headers: { 'Content-Type': 'application/json' },
				body,
			});

			return {
				json: TemplateOperations.parseResponse(response) as IDataObject,
				pairedItem: { item: i, input: 0 },
			};
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, this.getNode());
		}
	}

	async listTemplates(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
		const credentials = (await this.getCredentials('carboneApi')) as CarboneCredentials;

		// Get all list parameters
		const id = this.getNodeParameter('id', i, '') as string;
		const versionId = this.getNodeParameter('versionId', i, '') as string;
		const category = this.getNodeParameter('category', i, '') as string;
		const includeVersions = this.getNodeParameter('includeVersions', i, false) as boolean;
		const origin = this.getNodeParameter('origin', i, '') as string | number;
		const search = this.getNodeParameter('search', i, '') as string;
		const limit = this.getNodeParameter('limit', i, 50) as number;
		const cursor = this.getNodeParameter('cursor', i, '') as string;

		// Build query parameters
		const qs: Record<string, string | number | boolean> = {};
		if (id) qs.id = id;
		if (versionId) qs.versionId = versionId;
		if (category) qs.category = category;
		if (includeVersions) qs.includeVersions = includeVersions;
		if (origin !== '') qs.origin = origin;
		if (search) qs.search = search;
		if (limit) qs.limit = limit;
		if (cursor) qs.cursor = cursor;

		try {
			// Make the request to list templates using modern authentication helper
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'carboneApi', {
				method: 'GET',
				url: `${credentials.apiUrl}/templates`,
				qs: qs,
			});

			return {
				json: TemplateOperations.parseResponse(response) as IDataObject,
				pairedItem: {
					item: i,
					input: 0,
				},
			};
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, this.getNode());
		}
	}

	async uploadTemplate(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
		const credentials = (await this.getCredentials('carboneApi')) as CarboneCredentials;

		// Valider les données binaires
		this.helpers.assertBinaryData(i, binaryPropertyName);

		// Récupérer les informations du fichier binaire
		const binaryData = this.getInputData()[i].binary;
		if (!binaryData) {
			throw new NodeOperationError(this.getNode(), 'No binary data found', {
				description: 'Please ensure the binary data is properly configured in the previous node',
				itemIndex: i,
			});
		}
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

		// Get additional options for template upload
		const templateUploadAdditionalOptions = this.getNodeParameter(
			'templateUploadAdditionalOptions',
			i,
			{},
		) as TemplateUploadOptions;
		const versioning =
			templateUploadAdditionalOptions.versioning !== undefined
				? templateUploadAdditionalOptions.versioning
				: true;
		const uploadTemplateId = this.getNodeParameter('uploadTemplateId', i, undefined, {
			extractValue: true,
		}) as string | undefined;
		const name = templateUploadAdditionalOptions.name || '';
		const comment = templateUploadAdditionalOptions.comment || '';
		const category = this.getNodeParameter('category', i, '') as string;
		const tags = this.getNodeParameter('tags', i, []) as string[];
		const expireAt = templateUploadAdditionalOptions.expireAt || '';
		const deployedAt = templateUploadAdditionalOptions.deployedAt || '';

		// Convert file to base64 and send as JSON — avoids multipart array-encoding issues
		const templateBase64 = fileBuffer.toString('base64');

		const body: Record<string, unknown> = {
			template: templateBase64,
			versioning,
		};

		if (uploadTemplateId) body.id = uploadTemplateId;
		if (name) body.name = name;
		if (comment) body.comment = comment;
		if (category) body.category = category;
		if (tags.length > 0) body.tags = tags;
		if (expireAt) {
			body.expireAt = Number(
				typeof expireAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(expireAt)
					? TemplateOperations.convertIsoToUnixTimestamp(expireAt)
					: expireAt,
			);
		}
		if (deployedAt) {
			body.deployedAt = Number(
				typeof deployedAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(deployedAt)
					? TemplateOperations.convertIsoToUnixTimestamp(deployedAt)
					: deployedAt,
			);
		}

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'carboneApi', {
				method: 'POST',
				url: `${credentials.apiUrl}/template`,
				headers: { 'Content-Type': 'application/json' },
				body,
			});

			return {
				json: TemplateOperations.parseResponse(response) as IDataObject,
				pairedItem: {
					item: i,
					input: 0,
				},
			};
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, this.getNode());
		}
	}

	async downloadTemplate(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
		const templateId = this.getNodeParameter('templateId', i, undefined, {
			extractValue: true,
		}) as string;
		const credentials = (await this.getCredentials('carboneApi')) as CarboneCredentials;

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'carboneApi', {
				method: 'GET',
				url: `${credentials.apiUrl}/template/${templateId}`,
				returnFullResponse: true,
				encoding: 'arraybuffer',
			});

			const contentDisposition =
				((response.headers as IDataObject)['content-disposition'] as string) || '';
			let fileName = 'template';

			const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
			if (filenameMatch?.[1]) {
				fileName = filenameMatch[1].replace(/['"]/g, '');
			}

			const buffer = response.body as unknown as Buffer;
			return {
				json: {
					success: true,
					templateId,
					fileName,
					size: buffer.byteLength,
				},
				binary: {
					data: await this.helpers.prepareBinaryData(buffer, fileName),
				},
				pairedItem: { item: i, input: 0 },
			};
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, this.getNode());
		}
	}

	async deleteTemplate(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
		const templateId = this.getNodeParameter('templateId', i, undefined, {
			extractValue: true,
		}) as string;
		const credentials = (await this.getCredentials('carboneApi')) as CarboneCredentials;

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'carboneApi', {
				method: 'DELETE',
				url: `${credentials.apiUrl}/template/${templateId}`,
			});

			return {
				json: TemplateOperations.parseResponse(response) as IDataObject,
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

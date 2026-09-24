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
	origin?: number;
	sample?: unknown;
}

interface TemplateUpdateFields {
	id?: string;
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
	// The API requires Unix timestamps as integers, never as strings
	private static toUnixTimestamp(value: string | number): number {
		if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
			return Math.floor(new Date(value).getTime() / 1000);
		}
		return Number(value);
	}

	private static convertUnixTimestampToIso(timestamp: number): string | undefined {
		if (timestamp === 0) {
			return undefined;
		}
		return new Date(timestamp * 1000).toISOString();
	}

	private static parseResponse(response: unknown): unknown {
		// Parse string responses to avoid double encoded JSON
		let parsedResponse: unknown = response;
		if (typeof response === 'string') {
			try {
				parsedResponse = JSON.parse(response);
			} catch {
				// Keep the original response when parsing fails
				return response;
			}
		}

		// Map list responses: timestamps to ISO dates and origin codes to labels
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
					const originLabels: Record<number, string> = {
						0: 'API',
						1: 'Studio',
						2: 'Salesforce',
						3: 'Odoo',
						4: 'HubSpot',
					};
					if (typeof item.origin === 'number' && originLabels[item.origin] !== undefined) {
						item.origin = originLabels[item.origin];
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
		if (updateFields.id) body.id = updateFields.id;
		if (updateFields.name) body.name = updateFields.name;
		if (updateFields.comment) body.comment = updateFields.comment;
		const category = this.getNodeParameter('category', i, '') as string;
		if (category) body.category = category;
		const tags = this.getNodeParameter('tags', i, []) as string[];
		if (tags.length > 0) {
			body.tags = tags;
		}
		if (updateFields.deployedAt) {
			body.deployedAt = TemplateOperations.toUnixTimestamp(updateFields.deployedAt);
		}
		if ('expireAt' in updateFields) {
			// The field added but left empty cancels a scheduled deletion (expireAt = 0: never expires)
			body.expireAt = updateFields.expireAt
				? TemplateOperations.toUnixTimestamp(updateFields.expireAt)
				: 0;
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

		// Validate the binary input
		this.helpers.assertBinaryData(i, binaryPropertyName);

		// Read the binary file info
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

		// Send the file as base64 in a JSON body because multipart breaks array fields like tags
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
			body.expireAt = TemplateOperations.toUnixTimestamp(expireAt);
		}
		if (deployedAt) {
			body.deployedAt = TemplateOperations.toUnixTimestamp(deployedAt);
		}
		if (templateUploadAdditionalOptions.origin) {
			body.origin = templateUploadAdditionalOptions.origin;
		}
		// The API expects `sample` as an array with a single object ({data, complement, translations, enum})
		let sample = templateUploadAdditionalOptions.sample;
		if (typeof sample === 'string' && sample.trim() !== '') {
			try {
				sample = JSON.parse(sample);
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid JSON in Sample Data: ${(error as Error).message}`,
					{
						description: 'The Sample Data option must be valid JSON',
						itemIndex: i,
					},
				);
			}
		}
		if (sample && typeof sample === 'object') {
			body.sample = Array.isArray(sample) ? sample : [sample];
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

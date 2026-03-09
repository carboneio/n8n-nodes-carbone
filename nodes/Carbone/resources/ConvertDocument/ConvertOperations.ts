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

/**
 * Converts a Uint8Array (or ArrayBuffer view) to a base64 string
 * without relying on the Node.js Buffer global.
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	for (let j = 0; j < bytes.byteLength; j++) {
		binary += String.fromCharCode(bytes[j]);
	}
	return btoa(binary);
}

/**
 * Converts a plain string to a base64-encoded string
 * without relying on the Node.js Buffer global.
 */
function stringToBase64(str: string): string {
	// Use TextEncoder to handle UTF-8 properly, then encode as base64
	const encoder = new TextEncoder();
	const bytes = encoder.encode(str);
	let binary = '';
	for (let j = 0; j < bytes.byteLength; j++) {
		binary += String.fromCharCode(bytes[j]);
	}
	return btoa(binary);
}

export class ConvertOperations {
	/**
	 * Sends a base64-encoded document to POST /render/template?download=true
	 * and returns the converted PDF as binary output.
	 */
	private async callRenderTemplate(
		this: IExecuteFunctions,
		i: number,
		base64: string,
		converter?: string,
	): Promise<INodeExecutionData> {
		const credentials = (await this.getCredentials('carboneApi')) as CarboneCredentials;

		const requestBody: Record<string, unknown> = {
			data: {},
			template: base64,
			convertTo: 'pdf',
		};

		if (converter) {
			requestBody.converter = converter;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'carboneApi', {
			method: 'POST',
			url: `${credentials.apiUrl}/render/template`,
			qs: { download: 'true' },
			headers: { 'Content-Type': 'application/json' },
			body: requestBody,
			returnFullResponse: true,
			encoding: 'arraybuffer',
		});

		// Extract filename from Content-Disposition header
		const contentDisposition =
			((response.headers as IDataObject)['content-disposition'] as string) || '';
		let fileName = 'document.pdf';

		const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
		if (filenameMatch?.[1]) {
			fileName = filenameMatch[1].replace(/['"]/g, '');
		}

		const buffer = response.body as unknown as Buffer;
		const binaryData = {
			data: await this.helpers.prepareBinaryData(buffer, fileName),
		};

		return {
			json: {
				success: true,
				fileName,
				size: buffer.byteLength,
			},
			binary: binaryData,
			pairedItem: { item: i, input: 0 },
		};
	}

	/**
	 * Reads an n8n binary property and returns its content as a base64 string.
	 */
	private async readBinaryAsBase64(
		this: IExecuteFunctions,
		i: number,
		binaryPropertyName: string,
	): Promise<string> {
		this.helpers.assertBinaryData(i, binaryPropertyName);
		const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
		return fileBuffer.toString('base64');
	}

	/**
	 * Downloads a template by ID from Carbone and returns its content as base64.
	 */
	private async downloadTemplateAsBase64(
		this: IExecuteFunctions,
		i: number,
	): Promise<string> {
		const templateId = this.getNodeParameter('templateId', i, undefined, {
			extractValue: true,
		}) as string;
		const credentials = (await this.getCredentials('carboneApi')) as CarboneCredentials;

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'carboneApi', {
			method: 'GET',
			url: `${credentials.apiUrl}/template/${templateId}`,
			encoding: 'arraybuffer',
		});

		return arrayBufferToBase64(response as ArrayBuffer);
	}

	async convertHtmlToPdf(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
		const htmlSource = this.getNodeParameter('htmlSource', i) as string;
		const ops = new ConvertOperations();
		let base64: string;

		try {
			if (htmlSource === 'url') {
				const url = this.getNodeParameter('htmlUrl', i) as string;
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url,
					encoding: 'arraybuffer',
				});
				base64 = arrayBufferToBase64(response as ArrayBuffer);
			} else if (htmlSource === 'file') {
				const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
				base64 = await ops.readBinaryAsBase64.call(this, i, binaryPropertyName);
			} else if (htmlSource === 'templateId') {
				base64 = await ops.downloadTemplateAsBase64.call(this, i);
			} else if (htmlSource === 'rawHtml') {
				const rawHtml = this.getNodeParameter('rawHtml', i) as string;
				base64 = stringToBase64(rawHtml);
			} else {
				throw new NodeOperationError(
					this.getNode(),
					`Unknown HTML source: ${htmlSource}`,
					{ itemIndex: i },
				);
			}

			// HTML → PDF always uses Chromium converter
			return await ops.callRenderTemplate.call(this, i, base64, 'C');
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, this.getNode());
		}
	}

	async convertOfficeToPdf(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
		const officeSource = this.getNodeParameter('officeSource', i) as string;
		const converter = this.getNodeParameter('converter', i, 'L') as string;
		const ops = new ConvertOperations();
		let base64: string;

		try {
			if (officeSource === 'file') {
				const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
				base64 = await ops.readBinaryAsBase64.call(this, i, binaryPropertyName);
			} else if (officeSource === 'templateId') {
				base64 = await ops.downloadTemplateAsBase64.call(this, i);
			} else {
				throw new NodeOperationError(
					this.getNode(),
					`Unknown Office source: ${officeSource}`,
					{ itemIndex: i },
				);
			}

			return await ops.callRenderTemplate.call(this, i, base64, converter);
		} catch (error) {
			throw CarboneErrorHandler.handleApiError(error, this.getNode());
		}
	}
}

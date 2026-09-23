import { describe, it, expect } from 'vitest';
import type { IDataObject } from 'n8n-workflow';
import { RenderOperations } from '../nodes/Carbone/resources/RenderDocument/RenderOperations';
import { createExecuteFunctionsMock, requestOptions } from './helpers';

const renderOps = new RenderOperations();

// Response shape of the synchronous download branch (returnFullResponse + arraybuffer)
const downloadResponse = {
	headers: { 'content-disposition': 'attachment; filename="report.pdf"' },
	body: { byteLength: 4 },
};

describe('generateDocument - templateSource', () => {
	it('uses POST /render/{id} for templateSource "templateId"', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { templateSource: 'templateId', templateId: 'tmpl_123', data: '{}' },
			response: downloadResponse,
		});
		await renderOps.generateDocument.call(mock, 0);
		expect(requestOptions(httpRequest).url).toBe('https://api.carbone.io/render/tmpl_123');
	});

	it('falls back to "templateId" when templateSource is absent (v1.x workflow saved with the default)', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { templateId: 'tmpl_123', data: '{}' },
			response: downloadResponse,
		});
		await renderOps.generateDocument.call(mock, 0);
		expect(requestOptions(httpRequest).url).toBe('https://api.carbone.io/render/tmpl_123');
	});

	it('normalizes the v1.x boolean false to "templateId"', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { templateSource: false, templateId: 'tmpl_123', data: '{}' },
			response: downloadResponse,
		});
		await renderOps.generateDocument.call(mock, 0);
		expect(requestOptions(httpRequest).url).toBe('https://api.carbone.io/render/tmpl_123');
	});

	it('normalizes the v1.x boolean true to "base64" and posts to /render/template', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { templateSource: true, templateBase64: 'QkFTRTY0', data: '{}' },
			response: downloadResponse,
		});
		await renderOps.generateDocument.call(mock, 0);
		const options = requestOptions(httpRequest);
		expect(options.url).toBe('https://api.carbone.io/render/template');
		expect((options.body as IDataObject).template).toBe('QkFTRTY0');
	});
});

describe('generateDocument - convertTo and format options', () => {
	it('sends convertTo as a plain string when no format option is set', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: {
				templateSource: 'templateId',
				templateId: 'tmpl_123',
				data: '{}',
				convertTo: 'pdf',
				converter: 'L',
			},
			response: downloadResponse,
		});
		await renderOps.generateDocument.call(mock, 0);
		const body = requestOptions(httpRequest).body as IDataObject;
		expect(body.convertTo).toBe('pdf');
		expect(body.converter).toBe('L');
	});

	it('sends the { formatName, formatOptions } object form when format options are set', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: {
				templateSource: 'templateId',
				templateId: 'tmpl_123',
				data: '{}',
				convertTo: 'pdf',
				formatOptions: {
					EncryptFile: true,
					DocumentOpenPassword: 'secret',
					Watermarks: {
						watermarkValues: [
							{ text: 'CONFIDENTIAL', anchor: 'center', opacity: 0.1, size: 0, toPage: 0 },
						],
					},
				},
			},
			response: downloadResponse,
		});
		await renderOps.generateDocument.call(mock, 0);
		const body = requestOptions(httpRequest).body as IDataObject;
		expect(body.convertTo).toEqual({
			formatName: 'pdf',
			formatOptions: {
				EncryptFile: true,
				DocumentOpenPassword: 'secret',
				// size/toPage left at 0 mean "API default" and must not be sent
				Watermarks: [{ text: 'CONFIDENTIAL', anchor: 'center', opacity: 0.1 }],
			},
		});
	});

	it('maps the Interlaced/Translucent booleans to the 0/1 integers the API expects', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: {
				templateSource: 'templateId',
				templateId: 'tmpl_123',
				data: '{}',
				convertTo: 'png',
				formatOptions: { Interlaced: true, Translucent: false, PixelWidth: 800 },
			},
			response: downloadResponse,
		});
		await renderOps.generateDocument.call(mock, 0);
		expect((requestOptions(httpRequest).body as IDataObject).convertTo).toEqual({
			formatName: 'png',
			formatOptions: { Interlaced: 1, Translucent: 0, PixelWidth: 800 },
		});
	});

	it('ignores stale format options when convertTo does not support them', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: {
				templateSource: 'templateId',
				templateId: 'tmpl_123',
				data: '{}',
				convertTo: 'docx',
				formatOptions: { EncryptFile: true },
			},
			response: downloadResponse,
		});
		await renderOps.generateDocument.call(mock, 0);
		expect((requestOptions(httpRequest).body as IDataObject).convertTo).toBe('docx');
	});
});

describe('generateDocument - additional options and headers', () => {
	it('sends failOn, batchReportName and preReleaseFeatureIn from the options collection', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: {
				templateSource: 'templateId',
				templateId: 'tmpl_123',
				data: '{}',
				generateAdditionalOptions: {
					failOn: ['IMAGE_URL_ERROR'],
					batchReportName: 'report-{d.id}',
					preReleaseFeatureIn: 5000000,
				},
			},
			response: downloadResponse,
		});
		await renderOps.generateDocument.call(mock, 0);
		const body = requestOptions(httpRequest).body as IDataObject;
		expect(body.failOn).toEqual(['IMAGE_URL_ERROR']);
		expect(body.batchReportName).toBe('report-{d.id}');
		expect(body.preReleaseFeatureIn).toBe(5000000);
	});

	it('downloads synchronously (?download=true) with the egress authorization header', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: {
				templateSource: 'templateId',
				templateId: 'tmpl_123',
				data: '{}',
				generateAdditionalOptions: { egressAuthorization: 'Bearer img-token' },
			},
			response: downloadResponse,
		});
		await renderOps.generateDocument.call(mock, 0);
		const options = requestOptions(httpRequest);
		expect((options.qs as IDataObject).download).toBe('true');
		expect((options.headers as IDataObject)['carbone-egress-header-authorization']).toBe(
			'Bearer img-token',
		);
	});

	it('switches to asynchronous mode with webhook headers and no download flag', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: {
				templateSource: 'templateId',
				templateId: 'tmpl_123',
				data: '{}',
				generateAdditionalOptions: {
					webhookUrl: 'https://my-server.com/hook',
					webhookAuthorization: 'Bearer hook-token',
				},
			},
			response: { success: true, data: { renderId: '' } },
		});
		await renderOps.generateDocument.call(mock, 0);
		const options = requestOptions(httpRequest);
		expect(options.qs).toBeUndefined();
		const headers = options.headers as IDataObject;
		expect(headers['carbone-webhook-url']).toBe('https://my-server.com/hook');
		expect(headers['carbone-webhook-header-authorization']).toBe('Bearer hook-token');
	});

	it('downloads a generated document by render ID and extracts the file name', async () => {
		const { mock, httpRequest, prepareBinaryData } = createExecuteFunctionsMock({
			parameters: { renderId: 'r_123' },
			response: downloadResponse,
		});
		const result = await renderOps.getDocument.call(mock, 0);
		const options = requestOptions(httpRequest);
		expect(options.method).toBe('GET');
		expect(options.url).toBe('https://api.carbone.io/render/r_123');
		expect(prepareBinaryData).toHaveBeenCalledWith(downloadResponse.body, 'report.pdf');
		const json = result.json as IDataObject;
		expect(json.fileName).toBe('report.pdf');
		expect(json.renderId).toBe('r_123');
	});

	it('returns JSON with the render ID when Return Render ID is enabled', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: {
				templateSource: 'templateId',
				templateId: 'tmpl_123',
				data: '{}',
				returnRenderId: true,
			},
			response: { success: true, data: { renderId: 'r_123' } },
		});
		const result = await renderOps.generateDocument.call(mock, 0);
		expect(requestOptions(httpRequest).qs).toBeUndefined();
		expect((result.json as IDataObject).data).toEqual({ renderId: 'r_123' });
	});
});

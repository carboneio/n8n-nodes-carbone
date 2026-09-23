import { describe, it, expect } from 'vitest';
import type { IDataObject } from 'n8n-workflow';
import { TemplateOperations } from '../nodes/Carbone/resources/Template/TemplateOperations';
import { createExecuteFunctionsMock, requestOptions } from './helpers';

const templateOps = new TemplateOperations();

describe('updateTemplate - PATCH body', () => {
	it('sends ISO dates as integer Unix timestamps', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: {
				templateId: 'tmpl_123',
				updateFields: {
					expireAt: '2026-12-31T00:00:00.000Z',
					deployedAt: '2026-10-01T00:00:00.000Z',
				},
			},
		});
		await templateOps.updateTemplate.call(mock, 0);
		const body = requestOptions(httpRequest).body as IDataObject;
		expect(body.expireAt).toBe(Math.floor(new Date('2026-12-31T00:00:00.000Z').getTime() / 1000));
		expect(body.deployedAt).toBe(
			Math.floor(new Date('2026-10-01T00:00:00.000Z').getTime() / 1000),
		);
		expect(typeof body.expireAt).toBe('number');
		expect(typeof body.deployedAt).toBe('number');
	});

	it('sends expireAt = 0 (cancel scheduled deletion) when the field is added but left empty', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { templateId: 'tmpl_123', updateFields: { expireAt: '' } },
		});
		await templateOps.updateTemplate.call(mock, 0);
		expect((requestOptions(httpRequest).body as IDataObject).expireAt).toBe(0);
	});

	it('omits expireAt entirely when the field is not set', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { templateId: 'tmpl_123', updateFields: { name: 'New name' } },
		});
		await templateOps.updateTemplate.call(mock, 0);
		const body = requestOptions(httpRequest).body as IDataObject;
		expect('expireAt' in body).toBe(false);
		expect(body.name).toBe('New name');
	});

	it('sends the id field to move a version to another template', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { templateId: 'version_sha256', updateFields: { id: 'tmpl_destination' } },
		});
		await templateOps.updateTemplate.call(mock, 0);
		const options = requestOptions(httpRequest);
		expect(options.url).toBe('https://api.carbone.io/template/version_sha256');
		expect((options.body as IDataObject).id).toBe('tmpl_destination');
	});
});

describe('uploadTemplate - POST body', () => {
	const baseParameters = {
		binaryPropertyName: 'data',
		templateUploadAdditionalOptions: {},
	};

	it('sends the base64 template with versioning enabled by default', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { ...baseParameters },
			items: [{ json: {}, binary: { data: { fileName: 'template.docx' } } }],
		});
		await templateOps.uploadTemplate.call(mock, 0);
		const body = requestOptions(httpRequest).body as IDataObject;
		expect(body.template).toBe('VEVNUExBVEVfQkFTRTY0');
		expect(body.versioning).toBe(true);
	});

	it('sends origin and wraps the sample object into the expected array form', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: {
				...baseParameters,
				templateUploadAdditionalOptions: {
					origin: 1,
					sample: '{ "data": { "firstName": "John" } }',
				},
			},
			items: [{ json: {}, binary: { data: { fileName: 'template.docx' } } }],
		});
		await templateOps.uploadTemplate.call(mock, 0);
		const body = requestOptions(httpRequest).body as IDataObject;
		expect(body.origin).toBe(1);
		expect(body.sample).toEqual([{ data: { firstName: 'John' } }]);
	});

	it('throws a clear error when the sample option is invalid JSON', async () => {
		const { mock } = createExecuteFunctionsMock({
			parameters: {
				...baseParameters,
				templateUploadAdditionalOptions: { sample: '{ not json' },
			},
			items: [{ json: {}, binary: { data: { fileName: 'template.docx' } } }],
		});
		await expect(templateOps.uploadTemplate.call(mock, 0)).rejects.toThrow(
			'Invalid JSON in Sample Data',
		);
	});
});

describe('downloadTemplate / deleteTemplate / lists', () => {
	it('downloads a template as binary with the file name from Content-Disposition', async () => {
		const response = {
			headers: { 'content-disposition': 'attachment; filename="invoice.docx"' },
			body: { byteLength: 10 },
		};
		const { mock, httpRequest, prepareBinaryData } = createExecuteFunctionsMock({
			parameters: { templateId: 'tmpl_123' },
			response,
		});
		const result = await templateOps.downloadTemplate.call(mock, 0);
		const options = requestOptions(httpRequest);
		expect(options.url).toBe('https://api.carbone.io/template/tmpl_123');
		expect(options.encoding).toBe('arraybuffer');
		expect(prepareBinaryData).toHaveBeenCalledWith(response.body, 'invoice.docx');
		expect((result.json as IDataObject).fileName).toBe('invoice.docx');
	});

	it('deletes a template by ID', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { templateId: 'tmpl_123' },
			response: { success: true, message: 'Template deleted' },
		});
		const result = await templateOps.deleteTemplate.call(mock, 0);
		const options = requestOptions(httpRequest);
		expect(options.method).toBe('DELETE');
		expect(options.url).toBe('https://api.carbone.io/template/tmpl_123');
		expect((result.json as IDataObject).message).toBe('Template deleted');
	});

	it('lists categories and tags from their endpoints', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			response: { success: true, data: [] },
		});
		await templateOps.listCategories.call(mock, 0);
		await templateOps.listTags.call(mock, 0);
		expect(requestOptions(httpRequest, 0).url).toBe('https://api.carbone.io/templates/categories');
		expect(requestOptions(httpRequest, 1).url).toBe('https://api.carbone.io/templates/tags');
	});
});

describe('listTemplates - response mapping', () => {
	it('maps every origin value to its label', async () => {
		const { mock } = createExecuteFunctionsMock({
			parameters: {},
			response: {
				success: true,
				data: [
					{ id: '1', origin: 0 },
					{ id: '2', origin: 1 },
					{ id: '3', origin: 2 },
					{ id: '4', origin: 3 },
					{ id: '5', origin: 4 },
				],
			},
		});
		const result = await templateOps.listTemplates.call(mock, 0);
		const data = (result.json as IDataObject).data as IDataObject[];
		expect(data.map((item) => item.origin)).toEqual([
			'API',
			'Studio',
			'Salesforce',
			'Odoo',
			'HubSpot',
		]);
	});

	it('caps nothing itself but forwards the limit as-is', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { limit: 100 },
			response: { success: true, data: [] },
		});
		await templateOps.listTemplates.call(mock, 0);
		expect((requestOptions(httpRequest).qs as IDataObject).limit).toBe(100);
	});
});

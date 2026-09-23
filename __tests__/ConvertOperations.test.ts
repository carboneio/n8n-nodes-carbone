import { describe, it, expect } from 'vitest';
import type { IDataObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { ConvertOperations } from '../nodes/Carbone/resources/ConvertDocument/ConvertOperations';
import { createExecuteFunctionsMock, requestOptions } from './helpers';

const convertOps = new ConvertOperations();

const downloadResponse = {
	headers: { 'content-disposition': 'attachment; filename="converted.pdf"' },
	body: { byteLength: 4 },
};

describe('convertHtmlToPdf', () => {
	it('converts raw HTML with the Chromium converter, always to PDF', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { htmlSource: 'rawHtml', rawHtml: '<html></html>' },
			response: downloadResponse,
		});
		const result = await convertOps.convertHtmlToPdf.call(mock, 0);
		const options = requestOptions(httpRequest);
		expect(options.url).toBe('https://api.carbone.io/render/template');
		expect((options.qs as IDataObject).download).toBe('true');
		const body = options.body as IDataObject;
		expect(body.convertTo).toBe('pdf');
		expect(body.converter).toBe('C');
		// base64 of '<html></html>'
		expect(body.template).toBe('PGh0bWw+PC9odG1sPg==');
		expect((result.json as IDataObject).fileName).toBe('converted.pdf');
	});

	it('fetches the HTML from a URL without authentication before converting', async () => {
		const htmlBytes = new TextEncoder().encode('<p>ok</p>').buffer;
		const { mock, httpRequest, plainRequest } = createExecuteFunctionsMock({
			parameters: { htmlSource: 'url', htmlUrl: 'https://example.com/page.html' },
			plainResponse: htmlBytes,
			response: downloadResponse,
		});
		await convertOps.convertHtmlToPdf.call(mock, 0);
		expect(plainRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://example.com/page.html',
			encoding: 'arraybuffer',
		});
		// base64 of '<p>ok</p>'
		expect((requestOptions(httpRequest).body as IDataObject).template).toBe('PHA+b2s8L3A+');
	});

	it('downloads the stored template first when converting by template ID', async () => {
		const templateBytes = new TextEncoder().encode('HTML').buffer;
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { htmlSource: 'templateId', templateId: 'tmpl_html' },
			response: [templateBytes, downloadResponse],
		});
		await convertOps.convertHtmlToPdf.call(mock, 0);
		expect(httpRequest).toHaveBeenCalledTimes(2);
		expect(requestOptions(httpRequest, 0).url).toBe('https://api.carbone.io/template/tmpl_html');
		const renderOptions = requestOptions(httpRequest, 1);
		expect(renderOptions.url).toBe('https://api.carbone.io/render/template');
		expect((renderOptions.body as IDataObject).template).toBe('SFRNTA==');
	});

	it('rejects an unknown HTML source', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { htmlSource: 'carrier-pigeon' },
		});
		await expect(convertOps.convertHtmlToPdf.call(mock, 0)).rejects.toThrow(NodeApiError);
		expect(httpRequest).not.toHaveBeenCalled();
	});
});

describe('convertOfficeToPdf', () => {
	it('converts an n8n binary file with the selected converter', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { officeSource: 'file', binaryPropertyName: 'data', converter: 'I' },
			response: downloadResponse,
			items: [{ json: {}, binary: { data: { fileName: 'invoice.docx' } } }],
		});
		await convertOps.convertOfficeToPdf.call(mock, 0);
		const body = requestOptions(httpRequest).body as IDataObject;
		expect(body.converter).toBe('I');
		expect(body.convertTo).toBe('pdf');
		expect(body.template).toBe('VEVNUExBVEVfQkFTRTY0');
	});

	it('defaults to the LibreOffice converter', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { officeSource: 'file', binaryPropertyName: 'data' },
			response: downloadResponse,
			items: [{ json: {}, binary: { data: { fileName: 'invoice.docx' } } }],
		});
		await convertOps.convertOfficeToPdf.call(mock, 0);
		expect((requestOptions(httpRequest).body as IDataObject).converter).toBe('L');
	});
});

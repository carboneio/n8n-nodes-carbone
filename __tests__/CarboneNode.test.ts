import { describe, it, expect } from 'vitest';
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { Carbone } from '../nodes/Carbone/Carbone.node';
import { createExecuteFunctionsMock } from './helpers';

const carbone = new Carbone();

describe('Carbone node - execute dispatcher', () => {
	it('dispatches a template operation and returns one item per input item', async () => {
		const { mock } = createExecuteFunctionsMock({
			parameters: { resource: 'template', operation: 'listCategories' },
			response: { success: true, data: [{ name: 'Invoices' }] },
		});
		const result = await carbone.execute.call(mock as IExecuteFunctions);
		expect(result).toHaveLength(1);
		expect(result[0]).toHaveLength(1);
		expect((result[0][0].json as IDataObject).data).toEqual([{ name: 'Invoices' }]);
		expect(result[0][0].pairedItem).toEqual({ item: 0, input: 0 });
	});

	it('dispatches the renderDocument and convertDocument resources', async () => {
		const downloadResponse = {
			headers: { 'content-disposition': 'attachment; filename="out.pdf"' },
			body: { byteLength: 4 },
		};
		const { mock: renderMock } = createExecuteFunctionsMock({
			parameters: {
				resource: 'renderDocument',
				operation: 'get',
				renderId: 'r_1',
			},
			response: downloadResponse,
		});
		const renderResult = await carbone.execute.call(renderMock as IExecuteFunctions);
		expect((renderResult[0][0].json as IDataObject).fileName).toBe('out.pdf');

		const { mock: convertMock } = createExecuteFunctionsMock({
			parameters: {
				resource: 'convertDocument',
				operation: 'convertHtmlToPdf',
				htmlSource: 'rawHtml',
				rawHtml: '<html></html>',
			},
			response: downloadResponse,
		});
		const convertResult = await carbone.execute.call(convertMock as IExecuteFunctions);
		expect((convertResult[0][0].json as IDataObject).fileName).toBe('out.pdf');
	});

	it('throws a NodeOperationError for an unknown operation', async () => {
		const { mock } = createExecuteFunctionsMock({
			parameters: { resource: 'template', operation: 'teleport' },
		});
		await expect(carbone.execute.call(mock as IExecuteFunctions)).rejects.toThrow(
			NodeOperationError,
		);
	});

	it('collects the error per item instead of throwing when continueOnFail is on', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			parameters: { resource: 'template', operation: 'delete', templateId: 'tmpl_missing' },
		});
		httpRequest.mockRejectedValue({
			context: { data: { success: false, error: 'Template not found' } },
		});
		(mock.continueOnFail as unknown as () => boolean) = () => true;
		const result = await carbone.execute.call(mock as IExecuteFunctions);
		expect(result[0]).toHaveLength(1);
		expect((result[0][0].json as IDataObject).error).toBe('Template not found');
		expect(result[0][0].pairedItem).toEqual({ item: 0, input: 0 });
	});
});

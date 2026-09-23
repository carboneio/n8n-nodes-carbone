import { describe, it, expect } from 'vitest';
import type { ILoadOptionsFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { templateSearch } from '../nodes/Carbone/methods/templateSearch';
import { loadCategories } from '../nodes/Carbone/methods/loadCategories';
import { loadTags } from '../nodes/Carbone/methods/loadTags';
import { createExecuteFunctionsMock, requestOptions } from './helpers';

// ILoadOptionsFunctions is a subset of the mocked surface (getCredentials, getNode, helpers)
function loadOptionsMock(response: unknown) {
	const { mock, httpRequest } = createExecuteFunctionsMock({ response });
	return { mock: mock as unknown as ILoadOptionsFunctions, httpRequest };
}

describe('templateSearch', () => {
	it('lists templates and forwards the search filter', async () => {
		const { mock, httpRequest } = loadOptionsMock({
			data: [
				{ id: 'tmpl_1', name: 'Invoice', versionId: 'sha_1' },
				{ versionId: 'sha_2' },
			],
		});
		const result = await templateSearch.call(mock, 'Inv');
		expect((requestOptions(httpRequest).qs as Record<string, string>).search).toBe('Inv');
		expect(result.results).toEqual([
			{ name: 'Invoice - tmpl_1 - sha_1', value: 'tmpl_1' },
			{ name: 'unnamed - sha_2 - sha_2', value: 'sha_2' },
		]);
	});

	it('wraps API failures into a warning-level NodeOperationError', async () => {
		const { mock, httpRequest } = loadOptionsMock({});
		httpRequest.mockRejectedValue(new Error('boom'));
		await expect(templateSearch.call(mock)).rejects.toThrow(NodeOperationError);
	});
});

describe('loadCategories / loadTags', () => {
	it('prepends the None option to the category list', async () => {
		const { mock } = loadOptionsMock({ data: [{ name: 'Invoices' }] });
		const result = await loadCategories.call(mock);
		expect(result).toEqual([
			{ name: 'None', value: '' },
			{ name: 'Invoices', value: 'Invoices' },
		]);
	});

	it('maps tags and tolerates a response without data', async () => {
		const { mock } = loadOptionsMock({ data: [{ name: 'urgent' }] });
		expect(await loadTags.call(mock)).toEqual([{ name: 'urgent', value: 'urgent' }]);

		const { mock: emptyMock } = loadOptionsMock({});
		expect(await loadTags.call(emptyMock)).toEqual([]);
	});
});

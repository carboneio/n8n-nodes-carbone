import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { carboneApiRequest } from '../utils/carboneApiRequest';

export async function loadCategories(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const response = await carboneApiRequest.call(this, {
			method: 'GET',
			url: '/templates/categories',
			json: true,
		});

		const categories: Array<{ name: string }> = Array.isArray(response?.data) ? response.data : [];

		return [
			{ name: 'None', value: '' },
			...categories.map((cat) => ({ name: cat.name, value: cat.name })),
		];
	} catch {
		throw new NodeOperationError(this.getNode(), 'Failed to fetch categories from Carbone API', {
			level: 'warning',
		});
	}
}

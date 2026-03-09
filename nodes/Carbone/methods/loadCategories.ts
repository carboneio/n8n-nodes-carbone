import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function loadCategories(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const credentials = await this.getCredentials('carboneApi');

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'carboneApi', {
			method: 'GET',
			url: `${credentials.apiUrl}/templates/categories`,
			json: true,
		});

		const categories: Array<{ name: string }> = Array.isArray(response?.data) ? response.data : [];

		return [
			{ name: 'None', value: '' },
			...categories.map((cat) => ({ name: cat.name, value: cat.name })),
		];
	} catch {
		throw new NodeOperationError(
			this.getNode(),
			'Failed to fetch categories from Carbone API',
			{ level: 'warning' },
		);
	}
}

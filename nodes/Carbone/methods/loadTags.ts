import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { carboneApiRequest } from '../utils/carboneApiRequest';

export async function loadTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const response = await carboneApiRequest.call(this, {
			method: 'GET',
			url: '/templates/tags',
			json: true,
		});

		const tags: Array<{ name: string }> = Array.isArray(response?.data) ? response.data : [];

		return tags.map((tag) => ({ name: tag.name, value: tag.name }));
	} catch {
		throw new NodeOperationError(this.getNode(), 'Failed to fetch tags from Carbone API', {
			level: 'warning',
		});
	}
}
